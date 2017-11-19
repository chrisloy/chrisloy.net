How to interview a technical co-founder
===

A friend recently asked me for advice about how best to accomplish a tricky task. They were a non-technical co-founder of a startup, looking to bring on board a CTO to build their product.

This is an intimidating situation! Without outside help, our interviewing capabilities are usually limited to our own domain. At best, we can assess someone on skills that we have used or seen used in our current and previous roles. At worst, we get stuck in a loop of hiring people whose skills resemble only our own.

A non-technical founder interviewing a technical one is akin to a brain surgeon hiring a rocket scientist. Forgive the self-aggrandisement! Both may understand some common soft skills: managing a skilled team, maintaining a schedule, working under pressure and so on. But the surgeon's ability to assess offsetting aerodynamic drag against weight tolerances will be as limited as the scientist's knowledge of navigating inter-cranial cavities by keyhole surgery.

The following is staple advice that I offer to anyone looking to hire a technical co-founder. This is not a foolproof guide to hiring the world's best CTO - it is just some pointers to help you along. I assume that you have the ability to assess out the aforementioned soft skills - what follows is how to evaluate technical capability.

## Be sceptical of expertise

In any discipline, CVs can be a misleading guide to aptitude. They are open to everything from outright fraud to naïve hyperbole from the [Dunning Kruger effect](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect). In the case of software engineering, this effect is compounded by having many discrete skills - languages, databases and so on. Technical CVs often consist of lists of skills, perhaps qualified by amount of experience, but with no clear standard for comparison.

With such lists, it can be difficult to differentiate the budding bedroom coder from the skilled polyglot master. Depth of experience remains obscure. Therefore, CVs are not a trustworthy guide to level of experience, but merely how the author wishes to represent themselves. A strong CV is a necessary but in no way sufficient requirement of a technical co-founder.

> **TL;DR:** That CV you're holding is a load of hot air.

## Look for hard evidence

To glean a clearer picture, look for hard, incontrovertible evidence of technical prowess. There are several things to look out for. To do this, make sure you understand GitHub well enough to understand what forking is.

- **Open source contributions** - The gold standard is accepted contributions to major open source libraries. These are often repositories with a large number of stars (at least one hundred) on GitHub. The reason these are great is that they prove that their code has been reviewed and accepted as valuable by successful peers. Note that contributions of this kind may be rare (for example, [I have just two](https://github.com/chrisloy)).
- **Popular repositories** - Another great sign is code authored by that engineer, which is being used by other engineers. Again, GitHub is the best place to look here. Check their repositories on GitHub. Any with more than fifty stars or twenty forks is likely to have broken outside their social circle and found a wider user base.
- **Published work** - Many excellent lead engineers do not contribute to open source projects. They may nonetheless have a huge impact within a large company. Often, such organisations will have blogs or other material available online, discussing technical matters. Look for articles written by or about your candidate's work. If it is worth writing about, it will have inherent value.
- **Portfolio** - Finally, many engineers will have portfolios of work - either on their website or ready to send alongside their CV. These count for less than the above, but are more tangible than unsubstantiated CV claims. A good portfolio may not be a sign of deep technical expertise, but a bad one will help you to filter weak candidates from your shortlist.

These signs are ways of thinning the field, and many great engineers will have none of the above at all. The best way you can assess a potential technical co-founder remains a technical interview.

> **TL;DR:** If you read it on the internet, it's probably true.

## Be careful with coding tests

Most application processes for software jobs involve coding tests. I have done everything from coding algorithms on a white board to writing a whole application from scratch over the weekend. These kind of tests are useful but tricky to get right. There web abounds with advice and examples, so I will just highlight a few bear traps to avoid:

- **Do not get them to do real work for you** - The best way to annoy applicants (and to risk your IP escaping into the real world) is to ask someone to implement real features for your company. Do not ask people to work for free during their application! The coding test should be a sandbox for establishing their technical capability, nothing more.
- **Keep the test short** - Asking for a large time investment discriminates against people with less time on their hands. Remember this will differently affect people based on gender, social status, health and so on. You will immediately rule out lots of good applicants for no good reason. Keep tests brief and well-defined.
- **Have a strict time limit** - Having a defined time limit is helpful because it ensures you compare candidates fairly. I recommend no more than 3 hours spent for a take-home coding test. Leaving this open-ended will bias your application process to favour those with excess time on their hands. This is **not** what you should be optimising.
- **Be technology-agnostic where possible** - If your startup will be making an Android app, then your coding test should have them developing an Android app. But if your test is to write some algorithms, then let them pick their own technology. Your goal is to help the candidate show the best version of themselves - not trip them up with an unfamiliar domain.

If you are completely non-technical and have no-one technical who can help you with this step, do not omit it completely. Set a low bar (e.g. [fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz)) that any competent developer will quickly clear, and it will still help you to screen out very inexperienced engineers.

> **TL;DR:** Tests should be short, simple and time-bounded.

## Ask open-ended questions

When it comes to the actual interview, ask open-ended questions and allow the candidate to talk in depth about technical subjects. You want someone with broad technical experience and who is opinionated about technology. This is needed for the fast decision-making and design expertise that they will need, so let them talk passionately and at length about technical topics which interest them. Once you have a few good questions under your belt, you will easily spot the difference between those with interesting answers and those who take a stab in the dark and then trail off.

One key competency to establish is technical experience which is both *broad* and *deep*.

*Broad technical experience* comes from familiarity with different, equivalent technologies - multiple languages, multiple databases, multiple operating systems and so on. Here, you should check that the breadth of experience on their CV rings true.

*Deep technical experience* can be harder to determine, but is more important. They should know one stack inside out - and in my opinion, it does not matter which one.

For example, consider someone who has spent so long with Java that they understand every bytecode optimisation, how and when every loop is unrolled, what happens on the metal, what happens in main memory and when thread-local storage is appropriate, what the best high-level design patterns are, which middleware is outdated and why, and so on. This person will quickly pick up new languages. They have acquired the skills to fully understand such a domain, and will adapt to new ones more quickly as a result.

Likewise, someone who knows more than how to optimise a SQL query, but also the difference between hash joins and nested loops under the hood, will have a much easier time picking up Mongo, Redis or Riak.

Find someone who has an obsessional dedication to understanding *how their software really works*, and you will find a great asset to join your team.

> **TL;DR:** Find someone who has strong opinions, well-reasoned and well-founded.

## Use a pen and paper

If you are looking for a technical co-founder, you are not just looking for an experienced coder. You want someone with the vision and ability to turn a product idea into a reality. To do that, they will have to build a system which has many moving parts. Being able to quickly piece that jigsaw together is vital in technical leadership. You also need the ability to explain technical concepts to you, in a clear and coherent way, without dumbing down and without relying on technical jargon.

Give them a pen and paper, and get them to sketch out a complex system. This should either be something built, or something they have used and know well. They will probably draw lots of little boxes with arrows between them. Drill down into the detail! What does this line do? What is _physically_ happening here? Is there a cable, some text being sent over the internet, how fast is it, how do we upgrade it if we have more users? And so on.

Then do the same thing again with an imaginary product. I want a website that allows people to buy shoes. How do you build it? What are the components? How do payments work? How do we ensure there are no outages? What team do we need to build this? What if I want to let people upload pictures of their current shoes? What if we go viral and get a million sign-ups in one week?

You are looking for *technical creativity*. If they are comfortable with these kinds of challenges, if the above conversations are fun, fruitful and flowing, and if you can foresee that this will be the case when you are working with them day in, day out - congratulations! You have found your technical co-founder.

> **TL;DR:** You have to design this software too! Find someone who works well with you.

## Find someone to help!

With the above guide, you will have a decent chance of finding the technical hire to turn your idea into a reality. But remember that attitude, intelligence and cultural fit are as important as technical ability and leadership.

Ultimately, if you are completely non-technical, then even some of the simplified steps above are going to be difficult. As in all things, a second opinion, especially a well-qualified one, will give you the confidence to know that you are making the right choice. If you have an experience technical friend (assuming they don't want the job themselves) ask them to help you interview candidates. And if not, maybe you can find someone knowledgeable online, who might be happy to help out with a phone interview.

Good luck! This can be a daunting task. But the rewards of finding the right match for your company will be enormous - so spend the time to get it right.

> **TL;DR:** My contact details are below ;-)
