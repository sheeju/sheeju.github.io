---
layout: post
title:  "Postgresql Table Partitioning"
date:   2015-10-24 17:57:51
---

Let us say we have a table and the query performance on the said table is very bad, as a developer or database administrator there are certain stratagies improve the performance such as INDEXING, adjust database engine parameters etc.. and this may resolve the issue to a certian level but there is a point you understand that data in the table is performance bottleneck.

We do have another feature called as "TABLE PARTITIONING" which will improve the performance of the data reterival since we can sepearte the table's data into different child tables. Postgres table partitioning is important concept to understand so that we know how to partition the table.

# Partitioning Steps 

1. Creation of Parent table
2. Create Child tables with Check Conditions
3. Create trigger function on parent table
4. Create index

# Check Conditions

Check Conditions should be on an attribute and it has to be unique and it should not overlap. For example CHECK(ZIP BETWEEN 10000 AND 20000) and CHECK(ZIP BETWEEN 20000 AND 30000) is an error because they are ambiguous, it’s not cear where to put the records with ZIP 20000.

Check conditions is similar to WHERE clause but as mentioned above we need to make sure the conditions does not overlap, here is commonly used partioniing process 

# Partition Techniques

## Range Partitioning

### By Date

An example of this is a e-commerce application where customer order is stored in the child table by day/week/month. If you create partition by day/week/month then each child table will have customer orders stored for a particular day/week/month respectively.

### By numbers

An example of this is a user table where we need to store a range of values by primary key or any other integer column. If you create partition by range of numbers like 0 to 100,000,000 (1 million) data in first child partition and 100,000,001 to 200,000,000 (2 million) in second child partition and so on. 

## List Partitioning 

An example of this is by geographic location such as states. In this case, you can have 50 child tables, one for each state in your country.

## Hash partitioning

Not supported in postgres instead see Custom Partitoning

## Custom partitioning 

We can also have custom condition so that we can apply postgres string functions to check condition on a column. A clasic example in one of our product is to store "Weather" data and the zip code is in string, we can very well type cast the "Zip" column to integer and apply Range Check condition but considering the performance insted of type casting to integer I just applied [left](http://www.postgresql.org/docs/9.1/static/functions-string.html) string function to check the zip code range.

Here is EXPLAIN ANALYZE report why I considered left over type casting to integer.

```language-sql
EXPLAIN ANALYZE SELECT * FROM "Weather" WHERE left("Zip", 1) = '1';
                       QUERY PLAN
----------------------------------------------------------------------------
 Seq Scan on "Weather"  (cost=0.00..22.15 rows=4 width=70) 
						(actual time=0.010..0.013 rows=3 loops=1)
   Filter: ("left"(("Zip")::text, 1) = '1'::text)
   Rows Removed by Filter: 2
 Planning time: 0.041 ms
 Execution time: 0.026 ms
```

```language-sql
EXPLAIN ANALYZE SELECT * FROM "Weather" WHERE "Zip"::int > 1 AND 
	"Zip"::int < 20000;
                       QUERY PLAN
-----------------------------------------------------------------------------
 Seq Scan on "Weather"  (cost=0.00..30.25 rows=4 width=70) 
						(actual time=0.019..0.019 rows=0 loops=1)
   Filter: ((("Zip")::integer > 1) AND (("Zip")::integer < 20000))
   Rows Removed by Filter: 5
 Planning time: 0.109 ms
 Execution time: 0.047 ms
```

# Demo of table partitioning with custom condition

## Create parent Table

```language-sql
DROP TABLE IF EXISTS "Weather" CASCADE;
CREATE TABLE "Weather" (

    "Id"                        BIGSERIAL,

    -- Epoch of Weather Day
    "DayEpoch"                  INTEGER NOT NULL,

    -- Postal code
    "Zip"                       VARCHAR(20) NOT NULL,

    -- Units of Weather data F - Fahrenheit , C - Celsius
    "UOM"                       CHAR(1) NOT NULL DEFAULT 'F',

    -- Hourly temperature stored from 12 AM to 11 PM
    "HourlyTemp"                INTEGER[] NOT NULL
);
```

## Create Child table for Zip starting with 0, 1 and 2

```language-sql
CREATE TABLE "Weather_Z0" (
CHECK (  left("Zip", 1) = '0' )
) INHERITS ("Weather");

CREATE TABLE "Weather_Z1" (
CHECK (  left("Zip", 1) = '1' )
) INHERITS ("Weather");

CREATE TABLE "Weather_Z2" (
CHECK (  left("Zip", 1) = '2' )
) INHERITS ("Weather");
```

## Create trigger Functions

```language-sql
CREATE OR REPLACE FUNCTION "WeatherTriggerFunc"()
RETURNS TRIGGER AS $$
BEGIN
    IF ( left(NEW."Zip", 1) = '0' ) THEN
        INSERT INTO "Weather_Z0" VALUES (NEW.*);
    ELSIF ( left(NEW."Zip", 1) = '1' ) THEN
        INSERT INTO "Weather_Z1" VALUES (NEW.*);
    ELSIF ( left(NEW."Zip", 1) = '2' ) THEN
        INSERT INTO "Weather_Z2" VALUES (NEW.*);
    ELSE
        RAISE EXCEPTION 'Zip out of range Fix WeatherTriggerFunc() function!';
    END IF;
    RETURN NULL;
END;
$$
LANGUAGE plpgsql;
```

## Create trigger on parent Table

```language-sql
CREATE TRIGGER "WeatherTrigger"
    BEFORE INSERT ON "Weather"
    FOR EACH ROW EXECUTE PROCEDURE "WeatherTriggerFunc"();
```

## Create Index on child tables
```language-sql
CREATE INDEX "Weather_Z0_Index" ON "Weather_Z0"("Zip");

CREATE INDEX "Weather_Z1_Index" ON "Weather_Z1"("Zip");

CREATE INDEX "Weather_Z2_Index" ON "Weather_Z2"("Zip");
```

# Constraint exclusion

Constraint exclusion works with only range or equality check constraints. It might not work for constraints like the following

```language-sql
CREATE TABLE "Weather_Z0" (
CHECK (  left("Zip", 1) = '0' )
) INHERITS ("Weather");
```

It is very important the WHERE clause is similar to CHECK condition other wise constraint_exclusion will not be helpfull. The EXPLAIN ANALYZE option is very handy in checking if the constraint_exclusion is used in right way. Let us take below example query

This query will not make use of constrain_exclusion feature since the WHERE clause is not same as CHECK condition.

```language-sql
EXPLAIN ANALYZE SELECT * FROM "Weather" WHERE "Zip" = '10002';
                                  QUERY PLAN
--------------------------------------------------------------------------
 Append  (cost=0.00..208334.45 rows=593 width=147) 
		 (actual time=295.370..859.916 rows=200 loops=1)
   ->  Seq Scan on "Weather"  (cost=0.00..0.00 rows=1 width=120)
							  (actual time=0.000..0.000 rows=0 loops=1)
         Filter: (("Zip")::text = '10002'::text)
   ->  Seq Scan on "Weather_Z0"  (cost=0.00..69445.02 rows=198 width=147) 
								 (actual time=295.347..295.347 rows=0 loops=1)
         Filter: (("Zip")::text = '10002'::text)
         Rows Removed by Filter: 2000000
   ->  Seq Scan on "Weather_Z1"  (cost=0.00..69444.71 rows=197 width=147) 
								 (actual time=0.019..283.327 rows=200 loops=1)
         Filter: (("Zip")::text = '10002'::text)
         Rows Removed by Filter: 1999800
   ->  Seq Scan on "Weather_Z2"  (cost=0.00..69444.71 rows=197 width=147) 
								 (actual time=281.181..281.181 rows=0 loops=1)
         Filter: (("Zip")::text = '10002'::text)
         Rows Removed by Filter: 2000000
 Planning time: 0.175 ms
 Execution time: 859.990 ms
```

If we change the above query slightly to make sure the WHERE clause and CHECK condition is in sync we will get better performance by making use of constraint_exclusion feature.

```language-sql
EXPLAIN ANALYZE SELECT * FROM "Weather" WHERE left("Zip", 1) = left('10002', 1) 
											  AND "Zip" = '10002';
                                  QUERY PLAN
--------------------------------------------------------------------------
 Append  (cost=0.00..79444.60 rows=2 width=134)
		 (actual time=22.217..311.482 rows=200 loops=1)
   ->  Seq Scan on "Weather"  (cost=0.00..0.00 rows=1 width=120) 
							  (actual time=0.001..0.001 rows=0 loops=1)
         Filter: ((("Zip")::text = '10002'::text) AND ("left"(("Zip")::text, 1) = '1'::text))
   ->  Seq Scan on "Weather_Z1"  (cost=0.00..79444.60 rows=1 width=147) 
								 (actual time=22.215..311.422 rows=200 loops=1)
         Filter: ((("Zip")::text = '10002'::text) AND ("left"(("Zip")::text, 1) = '1'::text))
         Rows Removed by Filter: 1999800
 Planning time: 0.197 ms
 Execution time: 311.546 ms
```

# Reference

[http://www.mkyong.com/database/partition-table-in-postgresql-create-partition-part-1/](http://www.mkyong.com/database/partition-table-in-postgresql-create-partition-part-1/)

[http://www.linuxforu.com/2012/01/partitioning-in-postgresql/](http://www.linuxforu.com/2012/01/partitioning-in-postgresql/)

[http://www.if-not-true-then-false.com/2009/howto-create-postgresql-table-partitioning-part-1/](http://www.if-not-true-then-false.com/2009/howto-create-postgresql-table-partitioning-part-1/)
