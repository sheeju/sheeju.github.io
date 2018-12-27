---
layout: post
title:  "Running services using daemontools"
date:   2018-07-05 17:57:51
---

Daemontools is the best way to manage your processes that is required to be running always. If you have processes like catalyst development server or spooler process that are required to be running always and needs to be self sustainable if they are killed for some reason.

# Why Daemontools

http://cr.yp.to/daemontools/faq/create.html#why


|                 | **inittab** | **ttys** | **init.d** | **rc.local** | **/service** |
|  ------                                   | ------ | ------ | ------ | ------ | ------ |
|  Easy service installation and removal    | No  |No   |Yes  |No |Yes |
|  Easy first-time service startup          | No  |No   |No   |No |Yes |
|  Reliable restarts                        | Yes |Yes  |No   |No |Yes |
|  Easy, reliable signalling                | No  |No   |No   |No |Yes |
|  Clean process state                      | Yes |Yes  |No   |No |Yes |
|  Portability                              | No  |No   |No   |No |Yes |

# Installing daemontools

## Installing daemontools on Ubuntu - Version 1

```
apt-get install daemontools dameontools-run
```

This will install and setup autostart of svscanboot on system boot via /etc/inittab

```
SV:123456:respawn:/usr/bin/svscanboot
```

## Installing daemontools on Ubuntu - Version 2

1. Install daemontools

```
apt-get -y install daemontools
```

2. Create /etc/service directory

```
mkdir -p /etc/service
```

3. need to make a conf file for booting

```
cd /etc/init/
touch svscan.conf

echo "start on runlevel [2345]" > svscan.conf
echo "" >> svscan.conf
echo "expect fork" >> svscan.conf
echo "respawn" >> svscan.conf
echo "exec svscanboot" >> svscan.conf
```

4. Start svscan service

```
service svscan start
```

5. That's it. Now you can check it using command below:

```
ps -ef|grep svscan
```

## Installting daemontools on Centos

1. Install wget gcc and wget

```
    yum install gcc wget
```

2. Create a folder setup and wget the source

```
   mkdir -p /package
   chmod 1755 /package
   cd /package
   wget http://cr.yp.to/daemontools/daemontools-0.76.tar.gz
   tar -xzvf daemontools-0.76.tar.gz
   rm daemontools-0.76.tar.gz
```

3. Install the daemontools

```
   echo gcc -O2 -include /usr/include/errno.h > src/conf-cc
   ./package/install
```
  
4. Fix Deamontools for CentOS 6.x. To do that simply remove the added line from /etc/inittab then issue this:

```
    echo "start on runlevel [12345]" > /etc/init/svscan.conf
    echo "respawn" >> /etc/init/svscan.conf
    echo "exec /command/svscanboot" >> /etc/init/svscan.conf
```
   
5. Start svscan service

```
    initctl reload-configuration
    initctl start svscan
```
    
6. That's it. Now you can check it using command below:

```
    ps -ef|grep svscan
```

# Creating service

1. Create /services directory where we store all our services

```
mkdir /services

mkdir /services/catalystd
```

2. Run file for catalystd

Create a file run inside /services/catalystd directory

```
#!/bin/sh


echo `date`."\n"
echo "\catalystd: Starting\n"

exec 2>&1

echo "catalystd: Setting ENV Variables\n"
export CATALYSTAPP_WWW_ROOR="/home/sheeju/projects/CatalystApp"
export PERL5LIB=/home/sheeju/projects/lib/:${PERL5LIB}
export PGSERVICEFILE=/home/sheeju/projects/pg_service.conf

exec /usr/bin/perl \
        /home/sheeju/projects/CatalystApp/script/catalystapp_server.pl

```

3. Run file for catalystd log

```
#!/bin/bash

PATH=/bin:/usr/bin:/usr/local/bin:/sbin:/usr/sbin:/usr/local/sbin:/bin
#exec cat > /var/log/parserspoold/test.log
multilog t n100 s16777215 /var/log/catalystd 2>&1
```

# Daemontools Commands

1. Start service

```
ln -s /services/catalystd /etc/service
```

2. Remove service

```
rm /etc/service/catalystd
svc -dx /services/somerandomservice
```

3. Restart service

```
svc -t /service/somerandomservice
svc -k /service/somerandomservice
```

4. Check service uptime

```
sudo svstat /etc/service/catalystd
/etc/service/catalystd: up (pid 772) 349 seconds
```

5. Checking the logs

```
tail -f /var/log/catalystd/current
```

6. Checking the running processes

```
ps auxf
pstree -a 15234
```

# Links

[https://cr.yp.to/daemontools.html](https://cr.yp.to/daemontools.html)

[https://isotope11.com/blog/manage-your-services-with-daemontools](https://isotope11.com/blog/manage-your-services-with-daemontools)



