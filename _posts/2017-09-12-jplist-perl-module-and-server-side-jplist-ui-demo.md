---
layout: post
title:  "JPList Perl Module and Server side JPList UI Demo"
date:   2017-09-12 17:57:51
---

jPList is a flexible jQuery plugin for sorting, pagination and filtering of any HTML structure (DIVs, UL/LI, tables, etc). Get started at jplist.com

# Data Sources

Server side rendering for JPLIst depends on the module used for parsing the JPList Request and based on the request applying the request parameters to appropriate DB table and columns. 

## Data Source Examples for PHP/ASP

Below URL shows example of using PHP/ASP as server side backend for rendering server side data.

[https://jplist.com/datasourcesexamples/index](https://jplist.com/datasourcesexamples/index)

## Data Source Examples for Perl/Catalyst MVC

Below URL shows example of using Catalyst/Perl as server side backend for rendering server side data.

[https://jplistdemo-catalyst-perl.herokuapp.com/datasources](https://jplistdemo-catalyst-perl.herokuapp.com/datasources)

# JPList Module

The latest version of JPList module is available on [CPAN](https://metacpan.org/pod/JPList) and [Github](https://github.com/sheeju/JPList)

Any issues please report [here](https://github.com/sheeju/JPList/issues)

## Integration with CGI

```perl
use CGI::Request;
use JPList;

$req = new CGI::Request;       # fetch and parse request

my $jplist = JPList->new
            ({
                dbh             => $dbh,
                db_table_name   => 'Items', 
                request_params  => $req->param('statuses')
            });

my $jp_resultset = $jplist->get_resultset();

$jp_resultset->{data};

$jp_resultset->{count};

```

## Integration with Catalyst MVC

Add this below code in Catalyst Controller

```perl
use JPList;

my $jplist = JPList->new
            ({
                dbh             => $c->model('DB')->schema->storage->dbh,
                db_table_name   => 'Items', 
                request_params  => $c->request->body_params->{statuses}
            });

my $jp_resultset = $jplist->get_resultset();

$jp_resultset->{data};

$jp_resultset->{count};

```

## Integration with Dancer MVC

Add this below code in Dancer Controller

```perl
use JPList;

my $jplist = JPList->new
            ({
                dbh             => $dbh,
                db_table_name   => 'Items', 
                request_params  => params->{statuses}
            });

my $jp_resultset = $jplist->get_resultset();

$jp_resultset->{data};

$jp_resultset->{count};

```

# Links

[https://metacpan.org/pod/JPList](https://metacpan.org/pod/JPList)

[https://github.com/sheeju/JPList](https://github.com/sheeju/JPList)

[http://jplist.com](http://jplist.com)

[Datasources examples available on www.jplist.com](https://jplist.com/datasourcesexamples/index)

[Perl Datasources examples deployed on www.heruko.com](https://jplistdemo-catalyst-perl.herokuapp.com/datasources)

