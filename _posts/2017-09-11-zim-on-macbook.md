---
layout: post
title:  "Zim on Macbook"
date:   2017-09-11 17:57:51
---

I was a Linux user and one of my favourite tool on linux is [ZIM](http://zim-wiki.org/install.html). This is life saver for me since I store all my notes on ZIM wiki and it gives me an option to format and document in a technical friendly way.

After moving to MAC recently I was researching a way to install ZIM and running it as a desktop application.

## 1. Install homebrew

```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

## 2. Install Packages required for zim via homebrew

```bash
brew install gtk-mac-integration gtkspell3 wget

brew install pkg-config gtk+ python pygtk pygobject pygtksourceview graphviz`
```

## 3. Install ZIM

```
cd ~/bin
wget http://zim-wiki.org/downloads/zim-0.67.tar.gz
tar xvfz zim-0.67.tar.gz
rm -fr zim-0.67.tar.gz
```

## 4. Create an MAC Application

* Open Script Editor
* Open new script editor
`File->New`
* Add the below applescript code

```
tell application "Terminal"
    do script with command "zim"
end tell
```

* Export as Application with below options and save to Application directory

```
File->Export

File Format: Application
```

## 5. Change the Application icon with Zim icon

* Right-click the application for which you want to swap the icon, and select ‘Get Info’
* In the top left corner of the Info panel, you’ll see the app’s icon. From here, drag the new icon file over the original. Drop it when you see the green + bubble on your cursor.


<img src="{{ site.baseurl }}/assets/img/zim.png">