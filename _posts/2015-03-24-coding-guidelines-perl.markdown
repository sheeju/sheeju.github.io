---
layout: post
title:  "Coding Guidelines & Best Practices - Perl"
date:   2015-03-24 10:57:51
---

Coding guidelines is very important in all projects and especially when you have good amount of developers contributing to the project it becomes more important to follow common code styles so that the code is easy to understand and ship with consistent codebase.

This blog outlines coding guidelines we follow @ Exceleron Software and this coding standard is loosely based on Perl Tidy and JS Beautify. 

**This would be helpfull for Perl Development or Perl Web Development.**

# ViMconfig

Since we use VIM as our default editor for development, we install vimconfig to get all the features through VIM Configuration Files.

[https://github.com/sheeju/vimconfig](https://github.com/sheeju/vimconfig)

It includes personal vimrc config file with many features and some usefull plugins e.g.for html, Perl, javascript, PHP, Template Toolkit etc.

Some interesting features are 

* Auto Indentation plugins (4 spaces per tab)
* Highlighting for perl, html, js, tt, php etc..
* Template skeleton based on the extension of file, for eg: .pm, .pl, .html
* POD documentation formated to support perldoc reader for .pm file

# Comments

## Comment your code properly.

* Explain what code does, don't just convert perl to english.
* Comment entire block, not single lines
* Comments are not subtitles

```perl
# Loop through all bananas in the bunch
foreach my $banana (@bunch) {
	my $monkey = Monkey->new(); # Call Monkey 
	$monkey->eat($banana);		# make the monkey eat one banana
}
```

* Comments are not source control 

```perl
#
# 2014-11-10 - Added File (Alex)
# 2014-11-10 - Modified 1 (Sally)
# 2014-11-10 - Modified 2 (Alex)
# 2014-11-10 - Modified 3 (Alex)
#
```

## Avoid comments on the same line that create long lines

Below is example snippet of perl code which describes the comment on the same line of code which is difficult to link or relate when the comment is lengthy,

```perl
$country_code = $self->get_country_code($ENV{'REMOTE_ADDR'}); # get the country code
```
instead use below commenting style where comment is above the code.

```perl
# get the country code
$country_code = $self->get_country_code($ENV{'REMOTE_ADDR'});
```

## Avoid Obvious Comments

```perl
# get the country code
$country_code = $self->get_country_code($ENV{'REMOTE_ADDR'});
 
# if country code is US
if ($country_code == 'US') {
 
    # display the form input for state
    print $self->form_input_state();
}
```

When the text is that obvious, it's really not productive to repeat it within comments.

If you must comment on that code, you can simply combine it to a single line instead:

```perl
# display state selection 
$country_code = $self->get_country_code($ENV{'REMOTE_ADDR'});
if ($country_code == 'US') {
    print $self->form_input_state();
}
```

# Naming Conventions (Variables & Subroutines)

* Objects and modules names start with capital letter (eg: My::Module). 
* Functions or Methods use underscore character ("_") as a word separator and start with the word, which describes the action (eg: get_value(), set_value(), print_report()
* If sub/method needs only one argument, don't use arrays, hashes, or references. 
`set_value($val)` 
* If sub/method needs more then one argument, for maintainers sake, use named arguments in hash or hash reference. 
`print_report({Colored => 1, Monthly => 0})`
* Name hashes for their values, not their keys.

```perl
   # GOOD:
   %color = ('apple' => 'red', 'banana' => 'yellow');
   print $color{'apple'};          # Prints `red'

   # BAD:
   %fruit = ('apple' => 'red', 'banana' => 'yellow');
   print $fruit{'apple'};          # Prints `red'
```

* Use _ (underscore) for private or internal Methods

```perl
sub _internal {

}
```

* Constants are UPPERCASE_WITH_UNDERSCORES 

# Documentation

Creating on new .pm file using vimconfig will generate perl module with initial POD documentation Templates

`vi PAMS/Common/DBI.pm`

## Module Header & Licence: 

Comment block exists at the beginning of the source file containing Filename - Desc and Licence info

Here is the example format:

```perl
# ========================================================================== #
# lib/PAMS/Common/DBI.pm - DBI Common Connector 
# Copyright (C) 2015 Exceleron Software, LLC                                 
# ========================================================================== #
```

End of the file ensure the LICENCE in pod style is also same

```perl
=head1 LICENSE
   
Copyright (C) 2015 Exceleron Software, LLC.

=head1 AUTHORS
```

## Methods 

Each Method should have POD style document describing Parameters passed, return information and Description about the function 
 
```perl
=item C<get_conn>

Params : NONE
   
Returns: DBI Connector
   
Desc   : get_conn returns DBIx Connector, to change connector call switch_shard before get_conn
   
=cut
```

## Packages

Include some short working examples in each Package. These examples should represent two or three common use cases of the Objects

### Start of Package 

```perl
=head1 NAME
   
PAMS::Common::DBI - This module will have all the generic functions of DBI 
   
=head1 SYNOPSIS
   
my $pams_dbi = PAMS::Common::DBI->new;

Use Case 1: Get DBI Connection for System Shard
$pams_dbi->get_conn();

Use Case 2: Get DBI Connection for MDM Shard 1
$pams_dbi->switch_shard('MDM', 1);
$pams_dbi->get_conn();

=head1 DESCRIPTION
   
PAMS::DBI will have access to database conn
   
=head2 methods
   
=over 4
   
=cut
```

### Middle of Package 

Methods with small pod styled documentation will go here as explained above

### End of Packages

```perl
=back
   
=head1 LICENSE
   
Copyright (C) 2015 Exceleron Software, LLC.
   
=head1 AUTHORS
   
Sheeju Alex, <sheeju@exceleron.com>
   
=head1 SEE ALSO
   
=cut
```


`perldoc PAMS/Common/DBI.pm` - Should get nicely formatted pod document.

#Logging

It is important to use appropriate logging level for different type of log statement. Most of the programmers never pay attention to log levels and simply logging all the log statement in the same level (INFO or DEBUG).

The main advantage of logging framework is to selectively filter logging statement permanentely and gives flexiablity to select the logging levels or full logging for debugging application.

##ERROR

Something terribly wrong had happened, that must be investigated immediately. No system can tolerate items logged on this level.

`Example: Database unavailable, Shard Unavailable etc..`

##WARN

The process might be continued, but take extra caution. 

`Example: Default value used from Cache`

##INFO
    
Important business process has finished. In ideal world, administrator or advanced user should be able to understand INFO messages and quickly find out what the application is doing. 

`Example: XML Parser Started, Importer Started, Importer Ended`

##DEBUG
    
Developers messages

##TRACE

Very detailed information, intended only for development. 

`Example: Log statement that are temporary and that should be removed once the functionality is developer and tested.`

#Testing

When working with large projects like MDM, using procedural tests for object oriented code because difficult to manage. This is where Test::Class module will be very usefull, it gives freedom for you to organize your OO Test class in the similar namespace as your production OO codebase.

First, create a required module in your preffered namespace. Let's say for example we need to create DBI class with PAMS::Common namespace.

```perl
package PAMS::Common::DBI

use Moose;

...

1;
```

As a standard at Exceleron all the Test::Class modules will be placed in t/tests/ directory and all test class will start with Test:: so that we don't have namespace collision.

```perl
package Test::PAMS::Common::DBI;

use Test::Most;
use base 'Test::Class';

sub class { 'PAMS::Common::DBI' }

...

1;
```

Here is sample directory structure

```bash
lib/PAMS/Common/
lib/PAMS/Common/DBI.pm
t/
t/tests/
t/tests/Test/
t/tests/Test/PAMS
t/tests/Test/PAMS/Common
t/tests/Test/PAMS/Common/DBI.pm
t/run.pl
```

t/run.pl is the main testing script which invokes all the Test::Class Unit tests

```perl
use FindBin;
use lib 't/tests';
use lib "$FindBin::Bin/../lib";

use Test::Class::Load qw(t/tests);

Test::Class->runtests;
```

For more information on how to use Test::Class, refer this link

[http://www.slideshare.net/Ovid/testing-with-testclass](http://www.slideshare.net/Ovid/testing-with-testclass)

# Code Formating (Using Perltidy / JS Beautify) 

Working in team it is important to follow consistent code indentation and Grouping, after working on the code make use of perltidy or jsbeautifier to fix indentation, spacing etc.. 

## Perl Tidy

`perl bin/perltidyx My/Module.pm`

## Javascript Beautify

`perl bin/jsbeautify root/static/js/test.js`

## CSS Beautify

`perl bin/jsbeautify root/static/css/test.css css`

## HTML/Template Toolkit Beautify

`perl bin/jsbeautify templates/en-us/user_layout.tt html`

# Reference

[vimconfig](https://github.com/sheeju/vimconfig)

[perltidy](http://perltidy.sourceforge.net/)

[js-beautify](https://github.com/dinesh-it/js-beautify/)

[Perl Styles](http://perldoc.perl.org/perlstyle.html)

[Test::Class](http://www.slideshare.net/Ovid/testing-with-testclass)

[TDD](http://www.slideshare.net/SheejuAlex/test-driven-development-39367104)

[bin/perltidyx](https://github.com/sheeju/CatalystDemo/blob/master/bin/perltidyx)

[bin/jsbeautify](https://github.com/sheeju/CatalystDemo/blob/master/bin/jsbeautify)
