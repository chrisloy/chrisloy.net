---
layout: post
title:  "Running an Akka cluster in an EC2 Autoscaling Group"
---

I recently found myself attempting to set up an Akka cluster in a EC2 auto-scaling group. I was surprised to find that there is little in the way of instructional literature available online, and thought it may be useful to document the process I took. After a few false starts and stumbling blocks, I ended up with a resizable cluster running in EC2, capable of handling stack updates and resizes using CloudFormation.

In the interest of brevity I have omitted imports and some boilerplate from the code examples below; the full, working codebase is available in a [github repository][github] which you can fork to get started.

Setting up the application
---
The first hurdle to overcome is the basic setup of an Akka cluster. This is [well-documented on the Akka site][akka] but the basic steps are as follows.

Firstly, set up a new application using your build tool of choice. I'm using [SBT][sbt], for which I first create a new application:

```bash
mkdir akka-ec2
cd akka-ec2
mkdir -p src/main/scala src/main/resources project
touch build.sbt project/plugins.sbt
```

Then add the following dependencies into the __build.sbt__ configuration:

```scala
libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % "2.3.2",
  "com.typesafe.akka" %% "akka-cluster" % "2.3.2",
  "com.amazonaws" % "aws-java-sdk" % "1.7.8",
  "ch.qos.logback" % "logback-classic" % "1.0.6" % "runtime"
)
```

The first two pull in the Akka dependencies we'll be using. The [AWS SDK][aws-sdk] is going to be vital in cluster discovery when a new node starts up, and finally [Logback][logback] will work as our SLF4J provider to give us logging output.

For this example, we're going to build an executable by using the [SBT Assembly plugin][sbt-assembly]. So add the following to your __project/plugins.sbt__:

```scala
addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.11.2")
```

This in turn requires a few more settings in __build.sbt__ to specify the jar name and main class. Check the [example project][github] for details.

Node discovery
---
One of the main challenges of running an Akka cluster in an autoscaling environment concerns the ability of new nodes to discover the running cluster on startup. The [Akka documentation][akka] explains the two ways to do this: manually, or using _seed nodes_, which it describes as _"configured contact points for initial, automatic, join of the cluster."_

In practice this means that there must exist one or more known good nodes running on a given IP and port. If we want to avoid introducing nodes required to be _always-up_ (surely against the reason we're using an Autoscaling group in the first place) then we need some programmatic way of discovering already-running nodes. Since Akka nodes talk over TCP and are quite strict when accepting incoming connections, load balancers aren't going to help us out here - so we can turn instead to the EC2 APIs.

For a new node joining the cluster, on the assumption that all nodes are using the same port, we need to know two things:

- the IP address other nodes will use when referring to use
- the IP address of some or all of the nodes already running in the cluster

We will work on the assumption that the private IP addresses of each cluster are to be used, which should be sufficient within one region. The setup for a multi-region cluster would introduce a considerable amount of additional complexity.

To gather these IP addresses we will use the [AWS Java SDK][aws-sdk], specifically the [EC2][ec2] and [AutoScaling][autoscaling] client classes. Initialisation of these varies depending on the AWS region your application is running in; in this case I'm using _EU West 1_ in Ireland:

```scala
val credentials = new InstanceProfileCredentialsProvider
val region = Region.getRegion(Regions.EU_WEST_1)
val scaling = new AmazonAutoScalingClient(credentials) { setRegion(region) }
val ec2 = new AmazonEC2Client(credentials) { setRegion(region) }
```

The first thing we need is the [instance ID][glossary-i] of our node. This is found from an HTTP metadata service available on all EC2 instances. Since we don't have an HTTP client in scope, we can read this using some core Java classes:

```scala
def instanceId = {
  val conn = new URL("http://169.254.169.254/latest/meta-data/instance-id").openConnection
  val in = new BufferedReader(new InputStreamReader(conn.getInputStream))
  try in.readLine() finally in.close()
}
```

From this we can chain a few calls to AWS APIs, via the SDK. Since most of these return Java collections, this will be easier with some implicit conversions to Scala collection types:

```scala
import scala.collection.JavaConversions._
```

First, let's find out the name of the autoscaling group we're running in:

```scala
def groupName(instanceId: String) = {
  val result = scaling describeAutoScalingInstances {
    new DescribeAutoScalingInstancesRequest { setInstanceIds(instanceId :: Nil) }
  }
  result.getAutoScalingInstances.head.getAutoScalingGroupName
}
```

From that we can find out the instance IDs of all the other nodes in the same group:

```scala
def groupInstanceIds(groupName: String) = {
  val result = scaling describeAutoScalingGroups new DescribeAutoScalingGroupsRequest {
    setAutoScalingGroupNames(groupName :: Nil)
  }
  result.getAutoScalingGroups.head.getInstances.toList map (_.getInstanceId)
}
```

Next we need a function to find the set of instance metadata for each of these:

```scala
def instanceFromId(id: String): Instance = {
  val result = ec2 describeInstances new DescribeInstancesRequest {
    setInstanceIds(id :: Nil)
  }
  result.getReservations.head.getInstances.head
}
```

With the above, we now have everything we need to define methods for find both our IP address and those of all our sibling instances:

```scala
def currentIp = instanceFromId(instanceId).getPrivateIpAddress

def siblingIps: List[String] =
  groupInstanceIds(groupName(instanceId)) map instanceFromId collect {
    case instance if isRunning(instance) => instance.getPrivateIpAddress
  }
```

In the latter case, we are filtering to only include running instances, as the AWS APIs may also return data about instances still starting up, shutting down or already terminated. The filtering function looks like this:

```scala
val isRunning: Instance => Boolean =
  _.getState.getName == InstanceStateName.Running.toString
```

Note that even with this filtering, we are returning a list of _all_ currently running nodes. For the purposes of a small cluster of a few nodes this is fine, but if you are running a very large cluster of hundreds of nodes then there is no need to use all of them as seeds. Just return a few.

With our list of IPs in hand, we are now ready to start configuring our Akka cluster.

Akka configuration
---
In __src/main/resources__, we create a basic configuration file for Akka. We'll override some of these values in our startup code, but we can use the suggested template from the Akka docs to get us going:

```python
akka {
  actor {
    provider = "akka.cluster.ClusterActorRefProvider"
  }
  remote {
    log-remote-lifecycle-events = off
    netty.tcp {
      hostname = ""
      port = 0
    }
  }
  cluster {
    seed-nodes = ["akka.tcp://akka-ec2@127.0.0.1:2551"]
    auto-down-unreachable-after = 10s
  }
}
```

From the sibling IPs we found earlier, we can define the list of seed nodes we want to use. Note that this will include ourselves:

```scala
val seeds = siblingIps map (ip => s"akka.tcp://akka-ec2@$ip:2551")
```

Using these, we can construct a basic Akka configuration:

```scala
val overrideConfig =
  ConfigFactory.empty()
  .withValue("akka.remote.netty.tcp.hostname", ConfigValueFactory.fromAnyRef(currentIp))
  .withValue("akka.remote.netty.tcp.port", ConfigValueFactory.fromAnyRef("2551"))
  .withValue("akka.cluster.seed-nodes", ConfigValueFactory.fromIterable(seeds))
```

And finally create our ActorSystem:

```scala
val system = ActorSystem("akka-ec2", overrideConfig withFallback ConfigFactory.load())
```

To prove this has worked, let's create a simple Actor which can broadcast messages between nodes in the cluster.

Inter-node chatter
---
Create an Actor class and subscribe it to Cluster-level messages about member nodes:

```scala
class BroadcastActor extends Actor {
  private val cluster = Cluster(context.system)
  override def preStart(): Unit = {
    cluster.subscribe(
      self,
      initialStateMode = InitialStateAsEvents,
      classOf[MemberEvent],
      classOf[UnreachableMember])
  }
  override def postStop(): Unit = cluster.unsubscribe(self)
  def receive = ???
}
```

This configuration ensures we will receive messages each time a node joins or leaves the cluster. It also ensures that when we join the cluster, we will be given the current state of the cluster in the same format, with one message indicating each active node has come up.

To do something useful with this data, we need to maintain a set of the current members of the cluster. We can start building up a useful _receive_ method

```scala
private var members = Set.empty[Member]

def receive = {
  case MemberUp(member) =>
    members += member
  // ...
}
```

When a member goes down, we want to remove it from the set. Since the Member class holds current state, we can recognise the node based on its address:

```scala
def receive = {
  case MemberUp(member) =>
    members += member
  case MemberRemoved(member, previousStatus) =>
    members.find(_.address == member.address) foreach (members -= _)
  // ...
}
```

Let's create a simple _Message_ class which will tell our actor to broadcast a String to the equivalent actor in all other nodes:

```scala
case class Message(content: String)
```

When we receive a String, let's just print it out. This let's us finish off our receive method:

```scala
def receive = {
  case message: String =>
    println(s"Message from [${sender().path.toString}] : [$message]")
  case Message(content) =>
    members foreach (pathOf(_) ! content)
  case MemberUp(member) =>
    members += member
  case MemberRemoved(member, previousStatus) =>
    members.find(_.address == member.address) foreach (members -= _)
  case _: MemberEvent =>
    // ignore other events about members
}
```

The _pathOf_ method used above looks like this:

```scala
def pathOf(member: Member) = {
  context.actorSelection(RootActorPath(member.address) / "user" / self.path.name )
}
```

We can now add our finished actor to the actor system:

```scala
val broadcaster = system.actorOf(Props[BroadcastActor], name = "broadcast")
```

To prove that everything is working, we can send a randomised message at regular intervals:

```scala
implicit val executor = system.dispatcher
system.scheduler.schedule(0 seconds, 5 seconds) {
  val words = Random.shuffle(
    List("peter", "piper", "picked", "a", "peck", "of", "pickled", "pepper")
  )
  broadcaster ! Message(words mkString " ")
}
```

This is all the code we need.

Building the JAR
---
To build our application, we just use the SBT Assembly plugin we configured earlier:

```bash
sbt clean assembly
```

This will compile all our code and dependencies in one jar. Usage is simple:

```bash
java -jar target/scala-2.10/*.jar
```

However if you have been following the steps above, this will not work outside an EC2 instance. Refer to the [example project][github] if you want to see how to test this locally.

Deploying to EC2
---
In order to run the application, you will need to set up an EC2 autoscaling group in AWS, and deploy the jar built into __target/scala-2.10__ into each new instance, as per your usual deployment strategy.

Ensure in your security group settings that port 2551 is open for both ingress and egress. On each instance, you want to start up the application like this:

```bash
java -jar akka-ec2.jar
```

The node should look for other instances running in the same autoscaling group, and use them to join the cluster. If it is the first instance to start up, then it will form a new cluster.

Note that if you start two or more instances at the same time then you run the risk of splitting the cluster.

[github]: https://github.com/chrisloy/akka-ec2
[akka]: http://doc.akka.io/docs/akka/snapshot/java/cluster-usage.html
[sbt]: http://www.scala-sbt.org/
[aws-sdk]: http://aws.amazon.com/sdkforjava/
[logback]: http://logback.qos.ch/
[sbt-assembly]: https://github.com/sbt/sbt-assembly
[ec2]: http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/ec2/AmazonEC2Client.html
[autoscaling]: http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/autoscaling/AmazonAutoScalingClient.html
[glossary-i]: http://docs.aws.amazon.com/general/latest/gr/glos-chap.html#I
