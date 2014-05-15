---
layout: post
title:  "Javascript MVC frameworks"
date:   2014-05-15 16:57:51
---

Now a days there are many Javascript MVC frameworks in development and production use. I have used Backbone for couple of projects which is really good but still as a developer it is tempting to see and compare with other Javascript MVC frameworks.

>Recently I started researching and comparing MVC Frameworks

Here is good link which compares different in production MVC frameworks.

http://codebrief.com/2012/01/the-top-10-javascript-mvc-frameworks-reviewed/

I got impressed by EmberJS because of its Rich templating system with composed views and UI bindings, I also noticed that many AngularJS and Backbone developers moving to EmberJS. 

# Ember Advantages 

* Handlebars as its templating system
* It should be clear where code belongs and where to find It
* Change in one area of your app should not affect other areas.
* Well Organised
* Eliminages Boilerplate
* Loosely Coupled

# Clear Delineation of Responsibilities

		Model	Model	Model	Model
Router	Controller		Controller
		View			views
		Template		Template

* Templates define the HTML to render
* Models encapsulates the data and logic of your problem
* Controllers present data to a template for rendering, by proxing models and by managing local transient state.
* The Router transistion between a collection of routes, each representing a high-level application state.
* Each Route coordinates models and contorllers for its state and handles high-level events appropriately.
* Views execute DOM-related logic


## Router

The Router DSL is a map of your app

{% highlight js %}
App.Router.map(function() {
	this.resource('post', path: {'posts/:post_id'}, function () {
		this.route('comments');
	});	
});
{% endhighlight %}

PostRoute will load the Post model into the PostController and render the "post" template into the main outlet.

CommentsRoute will render the "comments" template with the CommentsController into the main outlet of the "post" template

> More Info visit this presentation - https://speakerdeck.com/lukemelia/ember-dot-js-the-architecture-advantage
