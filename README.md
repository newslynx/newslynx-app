NewsLynx App
============

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

The NewsLynx app has two main components:

1. An [ExpressJS server-side](http://expressjs.com/) JavaScript application, which is concerned with authentication, sessioning and requesting data from the api. We'll refer to this as the **"Express app"** or the **"Express side."**
2. A combination of multiple JavaScript [Single-Page Applications](https://en.wikipedia.org/wiki/Single-page_application). Each "page" in NewsLynx — currently Settings, Approval River, Articles and the Submit event page — are their own front-end JavaScript apps written using the [Backbone framework](http://backbonejs.org). We'll refer to this as the **"front-end."**

The front-end code communicates with the Express side through Express **routes** as defined in [`lib/routes/`](lib/routes/). Probaby the most important route [is the one](lib/routes/organizations.js#L49-L52) that redirects any URL that starts with `/api/` to the api endpoint and returns a JSON response.

### Express App architecture 



##### Authentication

##### Sessioning with LevelDB

##### Build process with Gulp

##### Transforming data

### Front-end architecture

#### How section-specific JavaScript is loaded

#### How section-specific CSS is loaded

### Settings

#### Change detection

#### Modal windows

### Approval River

#### Form construction

#### Form validation

### Articles

#### Comparison view

##### Isotope

#### Detail view


## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.


