---
layout: post
title:  "Postgresql Advanced Data Types"
date:   2015-05-14 17:57:51
---

NoSQL is buzz word in the database and computer world with its rapid growth. NoSQL databases range from key-value store to columunar databasees to document databases to graph databases.

RDBMS is best way to store data so that modren web application can make use of ORM to independently connect to database via objects. I am sure people who worked on RDBMS will agree that it is good to use advanced data types like ARRAY, HSTORE, JSON so that we an store data for better access and performance reasons.

Postgres has advanced data types so that we can use with relational database to store data, below are some advantages

* They are easy to access
* They have a lot of functionality around them
* They are durable
* They perform well (caution: we have to use it correctly)

Here are the list of data Types

# ARRAY 

Allows columns of the table to be defined as variable length multidimentional arrays. Arrays of any built-in tyoe or user defined type can be created.

```language-sql
CREATE TABLE bookmarks (
   id	SERIAL,
   link VARCHAR(512),
   tags VARCHAR(128)[]
);
```

Lets populate some data

```language-sql
INSERT INTO bookmarks VALUES (1, 'http://perl.org', '{"Perl", "C"}');
INSERT INTO bookmarks VALUES (1, 'http://php.net', '{"PHP", "C"}');
INSERT INTO bookmarks VALUES (1, 'http://amazon.com', '{"PHP", "C", "Perl"}');
```


```language-sql
SELECT * FROM bookmarks;
 id |       link        |     tags     
----+-------------------+--------------
  1 | http://perl.org   | {Perl,C}
  1 | http://php.net    | {PHP,C}
  1 | http://amazon.com | {PHP,C,Perl}
(3 rows)
```

## Array functions

Postgres have a bunch of [array functions](http://www.postgresql.org/docs/9.4/static/functions-array.html) that you can use for fitering based on the array value.

**Bookmarks tagged with Perl**

```language-sql
SELECT * FROM bookmarks WHERE ('Perl' = ANY(tags));
 id |       link        |     tags     
----+-------------------+--------------
  1 | http://perl.org   | {Perl,C}
  1 | http://amazon.com | {PHP,C,Perl}
(2 rows)

SELECT * FROM bookmarks WHERE tags @> '{Perl}';
 id |       link        |     tags     
----+-------------------+--------------
  1 | http://perl.org   | {Perl,C}
  1 | http://amazon.com | {PHP,C,Perl}
(2 rows)
```

**Bookmarks not tagged with Perl**

```language-sql
SELECT * FROM bookmarks WHERE NOT ('Perl' = ANY(tags));
 id |      link      |  tags   
----+----------------+---------
  1 | http://php.net | {PHP,C}
(1 row)

SELECT * FROM bookmarks WHERE ('Perl' != ALL(tags));
 id |      link      |  tags   
----+----------------+---------
  1 | http://php.net | {PHP,C}
(1 row)
```

**Convert Array to String**

```language-sql
SELECT array_to_string(ARRAY[1,2,NULL,4], ',', '*');
 array_to_string 
-----------------
 1,2,*,4
(1 row)
```

**Convert Array to Rows**

```language-sql
SELECT unnest(ARRAY[1,2,3]);
 unnest 
--------
      1
      2
      3
(3 rows)
```

**Convert columnar value to Array value**

```language-sql
SELECT array_agg(link) FROM bookmarks;
                     array_agg                      
----------------------------------------------------
 {http://perl.org,http://php.net,http://amazon.com}
(1 row)
```
## INDEXING

You can index an array but you have to use the array operators and the GIN index type.

```language-sql
CREATE INDEX idx_bookmarks on bookmarks USING GIN (tags);
```

Below are the list of operators that can be used on indexed queries

```language-sql
<@
@>
=
&&
```

# HSTORE

Posgtgres HSTORE is column type for storing key->value data (Schemaless data) sometimes called as documnet store. HStore is often compared to NoSQL document store.

Here is SQL statements to create table with HSTORE datatype, populating data etc..

```language-sql
ENABLE HSTORE Extension

CREATE EXTENSION hstore;

CREATE TABLE book (
    id SERIAL,
    name VARCHAR(512),
    author HSTORE
);
```

```language-sql
INSERT INTO book VALUES (1, 'First Book', 
	'first_name => "Bob", 
	last_name => "White", 
	title => "Mr"'
);
INSERT INTO book VALUES (1, 'Second Book', 
	'first_name => "Sally", 
	last_name => "White", 
	title => "Mrs"'
);
```

```language-sql
SELECT * FROM book WHERE author->'last_name' = 'White';
```
## HSTORE functions

[Refer here](http://www.postgresql.org/docs/9.4/static/hstore.html#HSTORE-FUNC-TABLE)

## INDEXING

Hstore has GiST and GIN index support for the @>, ?, ?& and ?| operators.

```language-sql
CREATE INDEX authoridx ON book USING GIST (author);

CREATE INDEX authoridx ON book USING GIN (author);

CREATE INDEX book_autor_first_name
	ON book USING GIN ( ((author->'first_name') );
```

# JSON 

The JSON datatype is meant for storing JSON-structured data. It will validate that the input JSON string is correct JSON. 

JSON can be used when you need to support nested objects but not just text or number when compared with HSTORE.

```language-sql
CREATE TABLE events (
  name varchar(200),
  visitor_id varchar(200),
  properties json,
  browser json
);
```

```language-sql
INSERT INTO events VALUES (
  'pageview', '1',
  '{ "page": "/" }',
  '{ "name": "Chrome", "os": "Mac", "resolution": { "x": 1440, "y": 900 } }'
);
INSERT INTO events VALUES (
  'pageview', '2',
  '{ "page": "/" }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1920, "y": 1200 } }'
);
INSERT INTO events VALUES (
  'pageview', '1',
  '{ "page": "/account" }',
  '{ "name": "Chrome", "os": "Mac", "resolution": { "x": 1440, "y": 900 } }'
);
INSERT INTO events VALUES (
  'purchase', '5',
  '{ "amount": 10 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1024, "y": 768 } }'
);
INSERT INTO events VALUES (
  'purchase', '15',
  '{ "amount": 200 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1280, "y": 800 } }'
);
INSERT INTO events VALUES (
  'purchase', '15',
  '{ "amount": 500 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1280, "y": 800 } }'
);
```

Some Example Queries 

**Browser Usage**

```language-sql
SELECT browser->>'name' AS browser, count(browser)
FROM events
GROUP BY browser->>'name';

 browser | count 
---------+-------
 Firefox |     4
 Chrome  |     2
(2 rows)
```

**Total Revenue per visitor**

```language-sql
SELECT visitor_id, SUM(CAST(properties->>'amount' AS integer)) AS total
FROM events
WHERE CAST(properties->>'amount' AS integer) > 0
GROUP BY visitor_id;

 visitor_id | total 
------------+-------
 5          |    10
 15         |   700
(2 rows)
```
## JSON functions

**array_to_json**

```language-sql
SELECT array_to_json(ARRAY[1,2,3]);
 array_to_json 
---------------
 [1,2,3]
(1 row)
```

**row_to_json**

```language-sql
SELECT row_to_json(bookmarks) from bookmarks;
                          row_to_json                          
---------------------------------------------------------------
 {"id":1,"link":"http://perl.org","tags":["Perl","C"]}
 {"id":1,"link":"http://php.net","tags":["PHP","C"]}
 {"id":1,"link":"http://amazon.com","tags":["PHP","C","Perl"]}
(3 rows)
```

**json_extract_path**

```language-sql
SELECT json_extract_path('{"a": 1, "b": 2, "c": [1,2,3]}'::json, 'c', '1');
 json_extract_path 
-------------------
 2
(1 row)
```

**json_extract_path_text**

```language-sql
SELECT json_extract_path_text('{"a": 1, "b": 2, "c": [1,2,3]}'::json, 'c', '1');
 json_extract_path_text 
------------------------
 2
(1 row)
```

For complete list of functions [click here](http://www.postgresql.org/docs/current/static/functions-json.html)

## INDEXING

CREATE INDEX events_browser_name_idx ON events (json_extract_path_text(browser, 'name'));

# JSONB 

Since it is difficult to serach within JSON we have new data type called as JSONB (Binary) which gives more operators so that searching becomes effective.

JSONB gives us flexibility and speed.

## JSONB functions

JSON and JSONB function are pretty much similar but some function has jsonb equivalent to work on binary json format.

[Refer here for complete list](http://www.postgresql.org/docs/current/static/functions-json.html)

## INDEXING

JSONB supports GIN indexing which gives better performance in SELECT statements

# Which one should I use? ARRAY/HSTORE/JSON/JSONB?

It is often difficult to select a datatype for our production use but it all depends on your use case. Below is set of rules that you can follow to select an advanced data type.

* ARRAY is straight forward selection if you just have array of values to be stored in a column. Eg: Hourly data in a day
* HSTORE provides more structure and if you have just key-value store use HSTORE
* JSON/JSONB is more versatile than HSTORE
* use JSON, If you need any of the following
	* Storage of validated JSON, without processing/indexing
    * preservation of white space in json text
	* Preservation of object key order
	* preservation of duplicate object keys
	* Maximum input/output speed
* For any other cases, use JSONB

# Reference

[Arrays](http://www.postgresql.org/docs/9.4/static/arrays.html)

[Array Functions](http://www.postgresql.org/docs/9.4/static/functions-array.html)

[Hstore](http://www.postgresql.org/docs/9.4/static/hstore.html)

[JSON/JSONB](http://www.postgresql.org/docs/9.4/static/datatype-json.html)

[JSON/JSONB Functions](http://www.postgresql.org/docs/9.4/static/functions-json.html)

[Postgre 9.4 Features](http://michael.otacoo.com/postgresql-2/postgres-9-4-feature-highlight-indexing-jsonb/)

