---
layout: post
title:  "Building am Ember App with PERL MVC framework - Part 4"
date:   2014-05-25 16:57:51
---

So here we go on Part 4, we will setup a complex navigation to list all the speakers in any meetup. Before we do that we need to add new dependencies to our app for mocking out remote requests.

We will be using Pretender by Ember Core member Trek Glowacki. Pretender is a nice DSL for faking out remote responses.

We first add Pretender to the bower.json in our project root:

```language-javascript
	"ember-load-initializers": "stefanpenner/ember-load-initializers#0.0.1",
    "pretender": "trek/pretender#0.0.5"
  }
}
```

then run bower install

Next we will need to tell Broccoli to compile these new dependencies:

```language-javascript
app.import({development:'vendor/route-recognizer/dist/route-recognizer.js'});
app.import({development:'vendor/FakeXMLHttpRequest/fake_xml_http_request.js'});
app.import({development:'vendor/pretender/pretender.js'});
```

We are telling Broccoli to only compile for the development environment.

Tell `JSHint` to ignore the Pretender constant. Open up `ember/tests/.jshintrc` and add "Pretender" to the end of the "predef" array.

Finally we need ember-data to make requests namespaced under `api` to our server:

```language-javascript
// ember/app/adapters/application.js
export default DS.ActiveModelAdapter.extend({
  namespace: 'api'
});
```

We should be in a good place to write our tests.

```language-javascript
// ember/tests/integration/speakers-page-test.js
import startApp from 'bostonember/tests/helpers/start-app';

var App, server;

module('Integration - Speaker Page', {
  setup: function() {
    App = startApp();
    var speakers = [
      {
        id: 1,
        name: 'Bugs Bunny'
      },
      {
        id: 2,
        name: 'Wile E. Coyote'
      },
      {
        id: 3,
        name: 'Yosemite Sam'
      }
    ];

    server = new Pretender(function() {
      this.get('/api/speakers', function(request) {
        return [200, {"Content-Type": "application/json"}, JSON.stringify({speakers: speakers})];
      });

      this.get('/api/speakers/:id', function(request) {
        var speaker = speakers.find(function(speaker) {
          if (speaker.id === parseInt(request.params.id, 10)) {
            return speaker;
          }
        });

        return [200, {"Content-Type": "application/json"}, JSON.stringify({speaker: speaker})];
      });
    });

  },
  teardown: function() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('Should allow navigation to the speakers page from the landing page', function() {
  visit('/').then(function() {
    click('a:contains("Speakers")').then(function() {
      equal(find('h3').text(), 'Speakers');
    });
  });
});

test('Should list all speakers', function() {
  visit('/speakers').then(function() {
    equal(find('a:contains("Bugs Bunny")').length, 1);
    equal(find('a:contains("Wile E. Coyote")').length, 1);
    equal(find('a:contains("Yosemite Sam")').length, 1);
  });
});

test('Should be able to navigate to a speaker page', function() {
  visit('/speakers').then(function() {
    click('a:contains("Bugs Bunny")').then(function() {
      equal(find('h4').text(), 'Bugs Bunny');
    });
  });
});

test('Should be able visit a speaker page', function() {
  visit('/speakers/1').then(function() {
    equal(find('h4').text(), 'Bugs Bunny');
  });
});
```

Take a look at the setup function. There is an array of objects that contains the speaker data, currently only ids and names. Below that we are setting up the request stubs. This code simply stubs out the expected server-side calls and returns a JSON string in the format ember-data expects.

Our four tests are very simple. 

* 1st tests the navigation
* 2nd tests the speakers are in the list
* 3rd tests that we can navigate to an individual speaker
* 4th tests that we can visit the speaker page directly.

Let's make each pass:

### 1st Test

```language-javascript
// ember/app/router.js
Router.map(function() {
  this.route('about');
  this.resource('speakers');
});
```

```language-javascript
// ember/app/templates/application.hbs
{% raw %}
{{link-to 'About' 'about'}}
{{link-to 'Speakers' 'speakers'}}
{% endraw %}
```

<pre class=" language-markup">
<code class=" language-markup">
// ember/app/templates/speakers.hbs
&lt;h3>Speakers&lt;/h3>
{% raw %}
{{outlet}}
{% endraw %}
</code>
</pre>

The first test should now be passing.

### 2nd Test

```language-javascript
// ember/app/router.js
Router.map(function() {
  this.route('about');
  this.resource('speakers', function() {
    this.route('show', {path: ':speaker_id'});
  });
});
```

```language-javascript
// ember/app/models/speaker.js
export default DS.Model.extend({
  name: DS.attr('string')
});
```

```language-javascript
// ember/app/routes/speakers/index.js
export default Ember.Route.extend({
  model: function() {
    return this.store.find('speaker');
  }
});
```

```language-markup
// ember/templates/speakers/index.hbs
{% raw %}
{{#each}}
  {{link-to name 'speakers.show' this}}
{{/each}}
{% endraw %}
```

The 2nd test should now be passing.	

### 3rd and 4th Test

<pre class=" language-markup">
<code class=" language-markup">
// ember/templates/speakers/show.hbs
{% raw %}
&lt;h4>{{name}}&lt;/h4>
{% endraw %}
</code>
</pre>

The 3rd & 4th tests should now be passing.

Passing tests are great and all, but let's actually make the app useable by getting our Catalyst backend in the game. 

### Catalyst REST API Setup

* Create a Model To Store Speakers

Models are modules which will have access to data. Speakers "model" can have functionality of list all,list , create, update, delete option. For this demo we are just using list all and list features.

** all: sub routine which will list output all the Speakers
** retrieve: sub routine which will list a speaker given the "id" integer.

```language-perl	
package EmberSpeakers::Model::Speakers;

use strict;
use base 'Catalyst::Model';
use List::Util qw/first max/;
use List::MoreUtils qw/first_index/;

my @data = (
    { id => 1, name => 'Bugs Bunny'},
    { id => 2, name => 'Wile E. Coyote'},
    { id => 3, name => 'Yosemite Sam'},
);

sub all {
    return [ map { id => $_->{id}, name => $_->{name} }, @data ];
}

sub retrieve {
    my ( $self, $id ) = @_;
    return first { $_->{id} == $id } @data;
}
```
* Create a Controller for REST Api

```language-perl
	package EmberSpeakers::Controller::Api::Speakers;
	use Moose;
	use namespace::autoclean;

	BEGIN { extends 'Catalyst::Controller'; }

	__PACKAGE__->config(
		action => {
			'*' => {
				# Attributes common to all actions
				# in this controller
				Consumes => 'JSON',
				Path => '',
			}
		}
	);

	# end action is always called at the end of the route
	sub end :Private {
		my ( $self, $c ) = @_;
		# Render the stash using our JSON view
		$c->forward($c->view('JSON'));
	}

	# We use the error action to handle errors
	sub error :Private {
		my ( $self, $c, $code, $reason ) = @_;
		$reason ||= 'Unknown Error';
		$code ||= 500;

		$c->res->status($code);
		# Error text is rendered as JSON as well
		$c->stash->{data} = { error => $reason };
	}


	# List all gifts in the collection
	# GET /gifts
	sub list :GET Args(0) {
		my ( $self, $c ) = @_;
		$c->stash->{speakers} = $c->model('Speakers')->all;
	}

	# Get info on a specific item
	# GET /gifts/:gift_id
	sub retrieve :GET Args(1) {
		my ( $self, $c, $gift_id ) = @_;
		my $gift = $c->model('Speakers')->retrieve($gift_id);

		# In case of an error, call error action and abort
		$c->detach('error', [404, "No such gift: $gift_id"]) if ! $gift;

		# If we're here all went well, so fill the stash with our item
		$c->stash->{data} = $gift;
	}

	# Create a new item
	# POST /gifts
	sub create :POST Args(0) {
		my ( $self, $c ) = @_;
		my $gift_data = $c->req->body_data;

		my $id = $c->model('Speakers')->add_new($gift_data);

		$c->detach('error', [400, "Invalid gift data"]) if ! $id;

		# Location header is the route to the new item
		$c->res->location("/gifts/$id");
	}

	# Update an existing item
	# POST /gifts/:gift_id
	sub update :POST Args(1) {
		my ( $self, $c, $gift_id ) = @_;
		my $gift_data = $c->req->body_data;

		my $ok = $c->model('Speakers')->update($gift_id, $gift_data);
		$c->detach('error', [400, "Fail to update gift: $gift_id"]) if ! $ok;
	}

	# Delete an item
	# DELETE /gifts/:gift_id
	sub delete :DELETE Args(1) {
		my ( $self, $c, $gift_id ) = @_;
		my $ok = $c->model('Speakers')->delete_gift($gift_id);
		$c->detach('error', [400, "Invalid gift id: $gift_id"]) if ! $ok;
	}

	1;
```

Test your Api and listall speakers

`http://localhost:3000/api/speakers/`

Result:

```language-javascript
{"speakers":[{"id":1,"name":"Bugs Bunny"},{"id":2,"name":"Wile E. Coyote"},{"name":"Yosemite Sam","id":3}]}
```

`http://localhost:3000/api/speakers/1`

Result:

```language-javascript
{"data":{"id":1,"name":"Bugs Bunny"}}
```

Start your Catalyst server with port 3000 and restart your ember server with the command 

```language-javascript
ember server --proxy http://localhost:3000
```

Now you can visit `http://localhost:4200` to see Speakers list

<img src="{{ site.baseurl }}/assets/img/ember-speakers.png">