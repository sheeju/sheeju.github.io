---
layout: post
title:  "Building an Ember App with PERL MVC framework - Part 3"
date:   2014-05-21 16:57:51
---

Let's implement some navigation in the Ember Speakers app.

* About
* Speakers

For this part we will work with faked out data. In the next part we will provide the Catalyst backend to push actual data.

Our first navigation test will be an easy one, create `ember/tests/integration/about-page-test.js`

```javascript
import startApp from 'emberspeakers/tests/helpers/start-app';

var App;

module('Integration - About Page', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('Should navigate to the About page', function() {
  visit('/').then(function() {
    click("a:contains('About')").then(function() {
      equal(find('h3').text(), 'About');
    });
  });
});
```
After writing this test we can confirm that our test is red in our browser. 

To make this green we need to add an About route, a link from the landing page to the About route, and a template for the About route.

### Route

```javascript
// ember/app/router.js
Router.map(function() {
  this.route('about');
});
```

### Link in Landing page Template

<pre class="markup">
<code class="markup">
// ember/app/templates/application.hbs
&lt;h2 id="title">Welcome to Boston Ember&lt;/h2>
{% raw %}
{{link-to 'About' 'about'}}

{{outlet}}
{% endraw %}
</code>
</pre>

### Tempalte for about page

<pre class=" markup">
<code class=" markup">
// ember/app/templates/about.hbs
&lt;h3>About&lt;/h3>

&lt;p>Boston Ember is the monthly meetup where awesome people get together
to do awesome Ember related things!&lt;/p>
</code>
</pre>

Your test should now be green. If you navigate to the root path in your browser you should be able to click through the app. What about getting back to root? We can add a test to for this navigation as well.

```javascript
// ember/tests/integration/landing-page-test.js
test('Should allow navigating back to root from another page', function() {
  visit('/about').then(function() {
    click('a:contains("Home")').then(function() {
      notEqual(find('h3').text(), 'About');
    });
  });
});
```
```markup
// ember/templates/application.hbs
{% raw %}
{{link-to 'Home' 'application'}}
{{link-to 'About' 'about'}}
{% endraw %}
```

<pre data-start="1" class="line-numbers">
  <code class="markup">
// ember/templates/application.hbs
{% raw %}
{{link-to 'Home' 'application'}}
{{link-to 'About' 'about'}}
{% endraw %}
</code></pre>

Nice, now we have very simple navigation and TDD working.

In next part let us have complex navigation linking with Speakers tab and integrate catalyst backend with dynamic list of speakers.
