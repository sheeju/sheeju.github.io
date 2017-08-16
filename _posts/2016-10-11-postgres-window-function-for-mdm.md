---
layout: post
title:  "Postgres Window Function for Meter Data Management"
date:   2016-10-11 14:53
---

An experiment with Postgres Window Function for Meter Data Management.

In Exceleron Meter Data Management (MDM) is core component of MyUsage product where the Readings from of every meter is stored in Register table. Consumption is identified by substracting the current reading with the previous reading and the calculated consumption is used for billing.


Register table stores reading of each day as received from AMI server, this is normally a CSV or XML file which is populated into Register table using CSV/XML Parser and Importer process.

# Consumption Calculation Window Function

Consumption calculation is done by using register reading for current day with previous day and calculate the difference in reading to get the usage consumption. So here is the WINDOW function using lead and row_number for getting leading register and row_number is used to filter out the duplicates. 

```sql

WITH regs AS (
    SELECT * FROM "Register" 
    WHERE "ConsumptionCalc" = 'false'
),
cp_regs AS (
    SELECT
        cur_reg.*,
        lead("Id", 1) OVER register_prev AS prev_id,
        lead("ReadEpoch", 1) OVER register_prev AS prev_readepoch,
        lead("Reading", 1) OVER register_prev AS prev_reading,
        row_number() OVER register_prev AS row_number
    FROM
        regs cur_reg
        WINDOW register_prev AS (
            PARTITION BY cur_reg."MeterId" ORDER BY cur_reg."ReadEpoch" Desc
        ) 
) 
SELECT 
    cp_regs."Id"                        AS "RegisterId", 
    prev_id                             AS "PrevRegisterId", 
    TO_TIMESTAMP(cp_regs."ReadEpoch")   AS "ReadDateTime", 
    TO_TIMESTAMP(prev_readepoch)        AS "PrevReadDateTime", 
    (cp_regs."Reading" - prev_reading)  AS "Consumption" 
FROM cp_regs
WHERE row_number = 1

```


# Test Data setup

## Register Table
    
```sql

    DROP TABLE IF EXISTS "Register" CASCADE;
    CREATE TABLE "Register" (
        "Id"                                            BIGSERIAL PRIMARY KEY NOT NULL,

        "MeterId"                                       BIGINT NOT NULL,

        -- Reading Epoch
        "ReadEpoch"                                     INTEGER NOT NULL,

        "Reading"                                       DOUBLE PRECISION NULL,

        "UOM"                                           VARCHAR(10) NOT NULL DEFAULT 'Kwh', -- Kwh/Gal

        "ConsumptionCalc"                       BOOLEAN NOT NULL DEFAULT FALSE,

        -- Stamp DataError if there is error in value
        "DataErrorId"                           INTEGER NULL,

        -- Who Created this Register?
        "CreatedUserId"                         BIGINT NOT NULL,

        -- When this Register was created
        "CreatedEpoch"                          INTEGER NOT NULL
    );

```

## Insert Test Data

```sql

WITH series as (
SELECT 
    dd as read_date, 
    ((EXTRACT(EPOCH FROM dd)-EXTRACT(EPOCH FROM TIMESTAMP '2016-12-01 23:00:00'))::integer / 86400) as index 
FROM generate_series( '2016-12-01 23:00:00'::timestamp, '2017-02-01 23:00:00'::timestamp, '1 day'::interval) dd
)
INSERT INTO "Register" ("MeterId", "ReadEpoch", "Reading", "UOM", "CreatedUserId", "CreatedEpoch")
SELECT 
    '1001'                          AS "MeterId", 
    EXTRACT(EPOCH FROM read_date)   AS "ReadEpoch", 
    index*100+1000                  AS "Reading", 
    'Kwh'                           AS "UOM", 
    1                               AS "CreatedUserId", 
    EXTRACT(EPOCH FROM NOW())       AS "CreatedEpoch"  
FROM series;

```

# Reference

[https://www.postgresql.org/docs/9.6/static/functions-window.html](https://www.postgresql.org/docs/9.6/static/functions-window.html)