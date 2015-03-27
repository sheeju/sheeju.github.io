---
layout: post
title:  "Javascript MVC frameworks"
date:   2014-05-15 16:57:51
---

Now a days there are many Javascript MVC frameworks in development and production use. I have used Backbone for couple of projects which is really good but still as a developer it is tempting to see and compare with other Javascript MVC frameworks.

>Recently I started researching and comparing MVC Frameworks

Here is good link which compares different in production MVC frameworks.

<a href="http://codebrief.com/2012/01/the-top-10-javascript-mvc-frameworks-reviewed/">http://codebrief.com/2012/01/the-top-10-javascript-mvc-frameworks-reviewed/</a>

I got impressed by EmberJS because of its Rich templating system with composed views and UI bindings, I also noticed that many AngularJS and Backbone developers moving to EmberJS. 

# Clear Delineation of Responsibilities

<img src="{{ site.baseurl }}/assets/img/ember-structure.png">

* Templates define the HTML to render
* Models encapsulates the data and logic of your problem
* Controllers present data to a template for rendering, by proxing models and by managing local transient state.
* The Router transistion between a collection of routes, each representing a high-level application state.
* Each Route coordinates models and contorllers for its state and handles high-level events appropriately.
* Views execute DOM-related logic


## Router

The Router DSL is a map of your app

```language-javascript
App.Router.map(function() {
	this.resource('post', path: {'posts/:post_id'}, function () {
		this.route('comments');
	});	
});
```

PostRoute will load the Post model into the PostController and render the "post" template into the main outlet.

CommentsRoute will render the "comments" template with the CommentsController into the main outlet of the "post" template

> More Info visit this presentation - https://speakerdeck.com/lukemelia/ember-dot-js-the-architecture-advantage

<script async class="speakerdeck-embed" data-id="82621660cf300130128222a1415176d2" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>
