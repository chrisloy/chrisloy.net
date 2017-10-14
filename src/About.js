import React from 'react';
import Markdown from 'react-markdown';

const content = `I'm a software engineer and data scientist who lives and works in London.

I've been doing this professionally since 2007, and in that time I've worked on all sorts of stuff, from small-scale web development to building distributed real time systems. I've come to believe that the best way to solve software problems of any size is to use rigorously modular design and be ready to throw away any code unfit for purpose. I've recently become a strong advocate of functional programming as one of the best ways to achieve this.

My first language was Java, and I have spent a lot of time with Scala. These days you'll mostly find me coding in Python, with my recent focus on machine learning (where I've picked up a degree and a handful of commercial experience). Check out my GitHub profile if you're interested in what I've been looking at recently.

This is my personal blog, so expect some stuff about me and my interests, but the focus is on what I do for a living - writing software.`

export const About = () => (
  <div>
    <h2>About me</h2>
    <Markdown source={content}/>
  </div>
)
