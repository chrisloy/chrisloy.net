---
layout: post
title:  "Building a simple JSON library"
subtitle: "Part 1: Model, rendering and lookup"
---

There are already [many][play-json] [good][rapture-json] [libraries][spray-json] [for][json4s] [handling][argonaut-json] [JSON][jackson-scala] in Scala. To which I add my own: [Simple JSON][github].

Why write this?
---
There are a few reasons. Firstly, building something from scratch is always an educational experience, and I wanted to gain a deeper understanding of the mechanics involved in basic parsing and rendering of JSON, and saw it as a chance to explore Scala's parser combinators.

But beyond this, I was interested in exploring what minimum set of features were needed to make such a library useful. Existing libraries in this space are richly featured, supporting custom bindings to classes or inferred bindings to case classes, and often including path-based transformations. The goal of Simple JSON is quite different: to provide a useful parsing and rendering layer between JSON (represented as Strings) and the Scala classes which most closely map to the data types in JSON. It is therefore as feature-lean as I could make it.

One final motivation might be to _improve_ upon existing solutions in one area, such as performance. This is not my goal here, and the code is not optimised for speed.

Data types
---
JSON has a limited number of data types. In order to keep things simple, we want to translate these directly to existing types in the Scala library. For each mapping we will declare a class which handles parsing, rendering and searching. The parent type of these will be ```JsonValue```.

| JSON             | Scala                  | Mapping        |
| ---------------- | --------------------   | -------------- |
| Boolean          | Boolean                | JsonBoolean    |
| String           | String                 | JsonString     |
| Number           | Double                 | JsonNumber     |
| Array            | Seq[JsonValue]         | JsonArray      |
| Object           | Map[String, JsonValue] | JsonObject     |
| null             | null                   | JsonNull       |
| undefined        | *                      | JsonUndefined  |

There are a few decisions that have been made here.

Firstly, using Doubles for all Numbers is a pragmatic way to attempt to catch all numeric values that might be used, but does require the usual precautions around handling floating point values.

Having an object to declare __null__ is important, as JSON allows us to explicitly include null as a value in an Array or Object, and we need to parse and render this.

The value __undefined__ is useful as the value returned from an object when the requested key is not present. Normally in Scala this would be represented by an ```Option[JsonValue]``` with a value of ```None```. This will be useful when looking up elements nested within an object tree, as we'll see later.

Rendering
---

If we make the decision to tie our rendering code to the data representation, then our base data type can be defined thus:

```scala
sealed trait JsonValue {
  def render: String
}
```

This gives us the ability to render out a String representation (no support for "pretty" or "compact" representations though) by calling the render method, ignorant of type.

We can now start building our model. Strings and numbers are easy to define:

```scala
case class JsonString(value: String) extends JsonValue {
  lazy val render = s"\"$value\""
}
case class JsonNumber(value: Double) extends JsonValue {
  lazy val render = new java.text.DecimalFormat("#.######################").format(value)
}
```

Booleans likewise (with a couple of case objects to minimise object creation):

```scala
object JsonBoolean {
  def apply(value: Boolean) = if (value) JsonTrue else JsonFalse
}
sealed abstract class JsonBoolean(value: Boolean) extends JsonValue
case object JsonFalse extends JsonBoolean(false) {
  val render = "false"
}
case object JsonTrue extends JsonBoolean(true) {
  val render = "true"
}
```

Null representation is straightforward too:

```scala
case object JsonNull extends JsonValue {
  val render = "null"
}
```

And finally undefined objects cannot be rendered, so the render method should throw an exception:

```scala
case object JsonUndefined extends JsonValue {
  def render = throw new Exception("Cannot render undefined values!")
}
```

That leaves us merely with collection types. Note that so far, none of these types has been searchable. The same holds true of arrays, but we are required to render all elements within the array first:

```scala
case class JsonArray(elems: Seq[JsonValue]) extends JsonValue {
  lazy val render = elems map (_.render) mkString ("[", ",", "]")
}
```

Finally we must deal with ```JsonObject```. This is going to be a wrapper for ```Map[String, JsonValue]```:

```scala
case class JsonObject(fields: Map[String, JsonValue]) extends JsonValue {
  lazy val render = fields map {
    case (key, value) => s"\"$key\":${value.render}"
  } mkString ("{", ",", "}")
}
```

With the small amount of code above, we can now define and render out any JSON structure. For example:

```scala
JsonString("something").render // "something"
JsonNumber(123.456).render // 123.456
JsonObject(Map("a" -> JsonTrue, "b" -> JsonNull)) // {"a":true,"b":null}
```

This is a rather verbose syntax for declaring objects, but it will suffice for now. We'll revisit this later by adding some syntactic sugar.

Searching
---

One last piece of the puzzle for our basic model is to support path-based key lookup. If we revisit our base trait, we can define a lookup method:

```scala
sealed trait JsonValue {
  def render: String
  def / (path: String): JsonValue = JsonUndefined
}
```

We've defined a base implementation of our ```/``` method to return undefined, since most of our datatypes cannot contain other references. The exception is ```JsonObject```, which we can now complete:

```scala
case class JsonObject(fields: Map[String, JsonValue]) extends JsonValue {
  lazy val render = fields map {
    case (key, value) => s"\"$key\":${value.render}"
  } mkString ("{", ",", "}")
  override def / (path: String) = fields.get(path) getOrElse JsonUndefined
}
```

As you can see, we're returning ```JsonUndefined``` if a requested key is absent. This means we can construct the following style of recursive search without fear of any exceptions being thrown:

```scala
json / "outer-key" / "inner-key" / "and-so-on"
```

If any of the intervening objects do not contain the specified key, the returned value of this operation will be ```JsonUndefined```.

This completes our basic JSON model. The full set of code can be seen [here][github-model].

Next?
---

We now have a basic representation of JSON data structures in Scala, with the ability to render these out as Strings, and to search using a basic path lookup. Next time, we can look at parsing an input string and marshalling it into our data structure.


[play-json]: http://www.playframework.com/documentation/2.0/ScalaJson
[rapture-json]: http://rapture.io/jsonSupport
[json4s]: https://github.com/json4s/json4s
[spray-json]: https://github.com/spray/spray-json
[argonaut-json]: http://argonaut.io/
[jackson-scala]: https://github.com/FasterXML/jackson-module-scala
[github]: https://github.com/chrisloy/simple-json
[github-model]: https://github.com/chrisloy/simple-json/blob/master/src/main/scala/net/chrisloy/json/JsonValue.scala
