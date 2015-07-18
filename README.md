NewsLynx App
============

<a href="http://travis-ci.org/newslynx/newslynx-app"><img src="https://camo.githubusercontent.com/507081a96e700a6ff393e8263e71856a85cb2f1a/68747470733a2f2f7365637572652e7472617669732d63692e6f72672f6d686b656c6c65722f696e6469616e2d6f6365616e2e706e673f6272616e63683d6d6173746572267374796c653d666c61742d737175617265" alt="Build Status" data-canonical-src="https://secure.travis-ci.org/newslynx/newslynx-app.png?branch=v2&amp;style=flat-square" style="max-width:100%;"></a>

V2 of NewsLynx's Web App.  This is still a WIP and we should be officially open-sourcing the codebase in late July 2015

For now, please read [the report](http://towcenter.org/research/the-newslynx-impact-tracker-produced-these-key-ideas/) we published for the [TowCenter](http://towcenter.org) on our prototype.

Getting started
---------------

Install dependencies with `npm install`.

To start the server, run

````bash
npm start
````

Thisc compiles your CSS and JS and runs the server with [Forever](https://github.com/foreverjs/forever).

When you see the following, it's done and you can visit <http://localhost:3000>

````
##################################
# HTTP listening on port 3000... #
##################################
````

Other start up commands 
-----

Alternate commands are in [`package.json`](package.json) under [`scripts`](package.json#L5). 

#### Developing locally

If you want to modify files and have the CSS and JS re-compiled automatically and the server restarted if necessary, do:

````
npm run dev
````

If you just want to watch the CSS and JS and re-compile when on change, do:

````
npm run watch-files
````

If you just want to watch the Express server and restart when its files change (templates, server js files), do:

````
npm run watch-server
````

These last two commands are best run in tandem in two separate shell windows. `npm run dev` does them both in one window for convenience.

Documentation
-------------

This documentation will explain the architecture and design patterns in use in the Express app and each section's Backbone app.

### Overall architecture

---

The NewsLynx app has two main components:

1. An [ExpressJS server-side](http://expressjs.com/) JavaScript application, which is concerned with authentication, sessioning and requesting data from the api. We'll refer to this as the **"Express app"** or the **"Express side."**
2. A combination of multiple JavaScript [Single-Page Applications](https://en.wikipedia.org/wiki/Single-page_application). Each "page" in NewsLynx — currently Settings, Approval River, Articles and the Submit event page — are their own front-end JavaScript apps written using the [Backbone framework](http://backbonejs.org). We'll refer to this as the **"front-end."**

The front-end code communicates with the Express side through Express **routes** as defined in [`lib/routes/`](lib/routes/). Probaby the most important route [is the one](lib/routes/organizations.js#L49-L52) that redirects any URL that starts with `/api/` to the api endpoint and returns a JSON response.

### Express App architecture 

---

#### Running the app

The main Express app file is [`lib/app.js`]. This file glues all the Express middleware together such as sessioning, cookies, routes and determines some logic for which routes require authentication. 

To run the app, you can start it from the command line through the file [`bin/www.js`](bin/www.js) by providing the `run` argument like so:

````
./bin/www.js run
````

It defaults to port `3000` but that can be changed with a second argument

````
./bin/www.js run 3001
````

In production and development, however, we run the server with [Forever](package.json#L6) and [Nodemon](bin/dev.sh), respectively. These tools have better support for keeping a NodeJS server alive for long periods of time. Nodemon is used in development since it can restart the server whenever files are modified.

#### Templates and loading CSS

Templates are written in [Jade](http://jade-lang.com/) and found in [`lib/views/`]. They generally extend from [`lib/views/layout.jade`](lib/views/layout.jade) which specifies "blocks" that subviews will insert themselves into. Here's what `layout.jade` looks like:

````jade
doctype html
html
  head
    title NewsLynx | 
      = info.title
    block css
    link(rel='stylesheet', href='/stylesheets/octicon/octicons.css')
    link(rel='stylesheet', href='/stylesheets/css/#{info.page}.css')
  body(data-section="#{info.page}")
    #main-wrapper
      include page-divisions/left-rail/index.jade
      #drawer(data-loading="true")
        block drawer
      #content(data-loading="true")
        block content
    block bootstrap-data
    block templates
    block scripts
````

You can see two variables here, `title` and `page`. These are important, since, as you can see, that variable name determines what CSS file is loaded, which we'll explain more in the [StyleSheets with Stylus](#stylesheets-with-Sstylus) section below. Generally, you can see that a **page-specifi** variable name will determine which CSS file we load. These variables match exactly the route name, for example, when you go to `/settings`, `info.title` is set to `Settings` in [`lib/routes/pages.js`](lib/routes/pages.js#L103) near line 103, which is then run through the `sanitize` function, which will put it in lowercase and replace spaces with dashes. We'll then fetch the file at `/stylesheets/css/settings.css`. 

A **page** data attribute is also set on the body, which is used for loading **page-specific** JavaScript files and is discussed below in [How page-specific JavaScript is loaded](how-page-specific-javascript-is-loaded).

So, with this main `layout.jade` file, we then have **page-specific** jade files which insert blocks. Take a look at [`lib/views/settings.jade`](lib/views/settings.jade) for an example.

#### Authentication

#### Sessioning with LevelDB

#### Bootstrapping and transforming data

### Front-end architecture

---

#### Build process with Gulp

The front-end JavaScript is written in separate files that are meant to be concatenated together and minified. We use [Gulp](http://gulpjs.com/) to do this and watch those files for changes. Gulp also transforms our Stylus files into normal CSS files. Checkout the [Gulpfile](gulpfile.js), which orchestrates all the events.

The final concatenated JavaScript file is saved to [`lib/public/javascripts/main.bundled.js`](lib/public/javascripts/main.bundled.js) and that file is loaded in every **page template**. Page-specific CSS files are put in the `css/` folder and are discussed more in detail below in [Stylesheets with Stylus](#stylesheets-with-stylus).

#### How page-specific JavaScript is loaded

#### Stylesheets with Stylus

The app uses a CSS preprocessor called [Stylus](https://learnboost.github.io/stylus/), which is a NodeJS package. These files are in [`lib/public/stylesheets/`](lib/public/stylesheets/). Each **page** has its own **top level file** such as `articles.styl`, `home.style`, `approval-river.styl` etc.

Styles are broken into smaller files so they can be more easily reused across views. These are all in [`lib/public/stylesheets/blueprint/`](lib/public/stylesheets/blueprint). Even smaller stylus files that are reused across "blueprint" files are in the the [`modules`](`lib/public/stylesheets/blueprint/`) subfolder. The nested folder structure helps show which files are meant to be used as shared assets.

During the [build process](#build-process-with-gulp), the **top level files** for each **page** are written into the `css/` folder at [`lib/public/stylesheets/css/`](lib/public/stylesheets/css/). To bring it full circle, these files, `articles.css`, `home.css`, `approval-river.css` are what `layout.jade` calls basd on the `info.page` variable, [as explained above](#templates-and-loading-CSS).

### Settings

#### Change detection

#### Modal windows

### Approval River

#### Form construction

#### Form validation

### Articles

#### Comparison view

#### Isotope

#### Detail view


## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.


