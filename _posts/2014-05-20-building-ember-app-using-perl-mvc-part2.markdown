---
layout: post
title:  "Building an Ember App with PERL MVC framework - Part 2"
date:   2014-05-20 16:57:51
---

In this part let us build some tests for Ember App

Now start your server:

```bash
cd ember
ember server
```

Open your browser and go to: http://localhost:4200/tests

You should see something like the following:

<img src="{{ site.baseurl }}/assets/img/ember-tests.png">

This is a typical <a href="http://qunitjs.com/">Qunit</a> test suite with some <a href="http://www.jshint.com/">JSHint</a> tests already in our app. What you'll notice in the lower right-hand corner is a blank white box. This box is where our integration tests will execute. This is an IFRAME so we can see our applications interacted with in real-time (albeit very fast real-time).

Let's build out a landing page for our app. We will TDD this entire application over this multi-part series. Create a new directory and file 

`ember/tests/integration/landing-page-test.js`

All of our files will be in <a href="http://wiki.ecmascript.org/doku.php?id=harmony:modules">ES6 module</a> format. If you are unfamiliar with ES6 modules I suggest you go and read up.

```javascript

import startApp from 'emberspeakers/tests/helpers/start-app';

var App;

module('Integration - Landing Page', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('Should welcome me to Ember Speakers', function() {
  visit('/').then(function() {
    equal(find('h2#title').text(), 'Welcome to Ember Speakers');
  });
});

```

Once you save this file go back to your browser. You should not need to reload anything, ember-cli has a live reload feature on file change. 

Now you should see your failing test:

<img src="{{ site.baseurl }}/assets/img/ember-tests1.png">

Let's make the test pass:

In ember/app/templates/application.hbs
	

```bash
<h2 id="title">Welcome to Ember Speakers</h2>
{% raw %}
{{ outlet }}
{% endraw %}
```

Check your test suite and it should be all green.

<img src="{{ site.baseurl }}/assets/img/ember-tests2.png">

Here we completed our first Ember test!
