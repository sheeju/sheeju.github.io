---
layout: post
title:  "Building am Ember App with PERL MVC framework - Part 1"
date:   2014-05-16 16:57:51
---

This blog will help you in building and structuring an application with ember as front-end using <a href="https://github.com/stefanpenner/ember-cli">ember-cli</a> and integrate ember application with <a href="http://catalystframework.org/">Catalyst MVC</a> framework as its backend.

I am replicating this blog with the <a href="">series created by DockYard</a> for building ember application with Ruby as backend. Since I am huge fan of PERL I have setup up same ember fornt-end with Catalyst as its backend.

##Dev tools reqired for this setup

* PERL
* Catalyst
* Node 0.10.26
* npm 1.4.7

For setting up PERL and catalyst you can refer <a href="http://catalystframework.org/">here</a>

Next we will install ember-cli

```language-markup
  	npm install -g ember-cli
```

Confirm that you have ember-cli installed:

```language-markup
	ember --version
```

You should see:

```language-markup
version: 0.0.27
```

or a greated version

## Setting up our project

For this project we will keep our catalyst and ember front-end in seperate directories inside top-level directory.

### Create a new top-level directory

```language-markup
mkdir emberspeakers
cd emberspeakers
```

### Now create catalyst project

```language-markup
catalyst.pl EmberSpeakers
perl script/emberspeakers_create.pl View JSON JSON
mv EmberSpeakers catalyst
```

First create catalyst project named "emberspeakers" and create a View with JSON type.

Let's confirm that our catalyst server runs

```language-markup
perl script/emberspeakers_server.pl
```

In your browser visit http://localhost:3000 and you should see 
"EmberSpeakers on Catalyst 5.90053"

### Now the ember project

```language-markup
ember new emberspeakers
mv emberspeakers ember
```

Now you should have a structure like this

```language-markup
emberspeakers
|- ember
|- catalyst
```

Let's confirm that our ember app runs:

```language-markup
cd ember
ember server
```

In your browser visit http://localhost:4200 and you should see "Welcome to Ember.js"

At this point you can put everything in your top level directory under version control:
	
```language-markup
git init
git add .
gc -m "Initial commit"
git remote add origin git@github.com:sheeju/emberspeakers.git
```

Here we end Part 1. In Part 2 we will focus on Ember and creating some functionality in our app.