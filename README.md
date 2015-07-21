NewsLynx App
============

> The NewsLynx web interface

<a href="http://travis-ci.org/newslynx/newslynx-app"><img src="https://camo.githubusercontent.com/507081a96e700a6ff393e8263e71856a85cb2f1a/68747470733a2f2f7365637572652e7472617669732d63692e6f72672f6d686b656c6c65722f696e6469616e2d6f6365616e2e706e673f6272616e63683d6d6173746572267374796c653d666c61742d737175617265" alt="Build Status" data-canonical-src="https://secure.travis-ci.org/newslynx/newslynx-app.png?branch=v2&amp;style=flat-square" style="max-width:100%;"></a>


This project is a part of [research project](http://towcenter.org/research/the-newslynx-impact-tracker-produced-these-key-ideas/) at the [Tow Center for Digital Journalism](http://towcenter.org) at Columbia University by Michael Keller & Brian Abelson.

Read our [**full documentation**](http://newslynx.readthedocs.org) for installing your own instance. The instructions below cover installing and developing the app as well as architectural documentation on how it works.

Getting started
---------------

Install dependencies with `npm install`.

If you haven't run `newslynx init` by following the [full install instructions](http://newslynx.readthedocs.org/en/latest/install.html), you can still test out the app by creating `.newslynx` folder in your home folder and creating a `config.yaml` file that looks like the following (change the secret key to something else):

````yaml
api_version: v1
newslynx_app_secret_key: chicken-burrito-grande
https: false
api_url: http://localhost:5000
````

To recap, make a file that looks like the one above and put it in `~/.newslynx/config.yaml`. Without having a server running locally, you won't get passed the login page, but at least you can make sure you get that far.

### Running the server

To start the server, run

````bash
npm start
````

This compiles your CSS and JS and runs the server with [Forever](https://github.com/foreverjs/forever).

When you see the following, it's done and you can visit <http://localhost:3000>.

**Note**: If you are running this in production, you want to run it in behind https and tell the app you are doing so one of two ways:

1. Run it with the environment variable `NEWSLYNX_ENV=https`
2. Set `https: true` in your `~/.newslynx/config.yaml` file

This will make sure your cookies are set securely.

````
#####################################
# HTTP listening on 0.0.0.0:3000... #
#####################################
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

Templates are written in [Jade](http://jade-lang.com/) and found in [`lib/views/`]. They extend from [`lib/views/layout.jade`](lib/views/layout.jade) which specifies "blocks" that subviews will insert themselves into. Here's what `layout.jade` looks like:

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
      block main-wrapper-contents
    #global-loading
    block bootstrap-data
    block templates
    block scripts
````

**Note:** If you open up [`layout.jade`](lib/views/layout.jade) you'll see it has all of this ugly JavaScript describing menu items like `Copy`, `Paste` and `Reload`. This is to construct menu items for the [Desktop application](http://github.com/newslynx/newslynx-electron) so we're skipping that here.

You can see two variables here, `title` and `page`. These are important, since, as you can see, that variable name determines what CSS file is loaded, which we'll explain more in the [StyleSheets with Stylus](#stylesheets-with-Sstylus) section below. Generally, you can see that a **page-specifi** variable name will determine which CSS file we load. These variables match exactly the route name, for example, when you go to `/settings`, `info.title` is set to `Settings` in [`lib/routes/pages.js`](lib/routes/pages.js#L103) near line 103, which is then run through the `sanitize` function, which will put it in lowercase and replace spaces with dashes. We'll then fetch the file at `/stylesheets/css/settings.css`. 

A **page** data attribute is also set on the body, which is used for loading **page-specific** JavaScript files and is discussed below in [How page-specific JavaScript is loaded](how-page-specific-javascript-is-loaded).

So, with this main `layout.jade` file, we then have **page-specific** jade files which insert blocks. Each of these inherit from [`lib/views/page.jade`](lib/views/page.jade)

Here's what that file looks like:

````jade
extends layout

block main-wrapper-contents
  include includes/left-rail/index.jade
  #drawer(data-loading="true")
    block drawer
  #content(data-loading="true")
    block content
````

Take a look at [`lib/views/settings.jade`](lib/views/settings.jade) for an example of a **"Page"** layout file, which inserts code into the `drawer` block, or the `content` block.

#### Authentication & interacting with the Core API

Every API call must include `org` and `apikey` query parameters. Read more in the [Newslynx Core](http://newslynx.readthedocs.org/en/latest/api.html#authentication) documentation for more specifics. As far as the App is concerned, all user login operations are handled by routes in [`lib/routes/organizations.js`](lib/routes/organizations.js).

Logging in is done by sending a POST request to `/login` containing the following data:

````json
{
  "email": "<string>",
  "password": "<string>",
  "remember_me": "<string>"
}
````

The `remember_me` value is set via a checkbox, which will serialize to `on` if checked and falsey if not. That value will set the `maxAge` of the session cookie to the distant future so that a user does not need to enter their information until they logout.

[You can see](lib/routes/organizations.js#L26) it's also doing a few things with this `redirect_url` business. The idea here is that if you have not authenticated, and you want to go to, says, `/articles`, you will be redirected to login. After you login, the expectation is that you will proceed to where you originally intended. To do that is both simple and complicated.

**The simple part** is that you can stash the incoming url on the `req.session` object, which is what we do initially in [`app.js`](lib/app.js#L93) near line 93. That url won't include anything in the hash, however, because the server never receives that information — it considers it below its station, it is the domain of the client and must not rise to such peaks.

For example, if we go to `/articles#detail`, Express only sees `/articles` as the page. This is better than nothing, though, so we save it as `req.session.redirect_page`. So how do we save the `#` stuff?

**The complicated part** is that we can save the hash client-side once we get to the login page by putting in some javascript that writes the hash to a hidden input field. When we submit our login form, we also submit the page where we intended to go. The jade template inserts that markup below the `Remember me` button:

````jade
  .form-row
    label 
      input(type='checkbox' name="remember_me") 
      | Remember me
    //- Handle redirects by stashing the # portion of the url in a hidden field, which will then be picked up by our login POST endpoint
    script.
      var href = document.location.href
      if (href.indexOf('logout') === -1){
        document.write('<input type="hidden" name="redirect_url" value="'+href+'"/>');
      }
````

**Note** How we don't stash this if we are on the `logout` page since we would be redirected to logging out.

So if we want to go to the `/articles#detail` page, the object we POST actually looks like this:

````
{
  "email": "<string>",
  "password": "<string>",
  "remember_me": "<string>",
  "redirect_url": "/login#detail"
}
````

Notice how it thinks we want to go to the login page, plus our original hash, even though we requested `/articles#detail`. This is because the `document.location.href` is executing on the login page. So it preserves our hash but not the page!

Putting two and two together, Express was able to store the page, but not the hash. The client can store the hash, but not the original page. The rest of the code in our login POST endpoint replaces the `/login` with our previously saved page. Phew!

This request is then forwarded to the **almighty auth.relay** function, which handles communication with the **Core API**. It deserves a few words.

##### Talking to the Core API

All communication with the **Core API** is handled throgh [`lib/utils/auth.js`](lib/utils/auth.js). For logging in this, means setting data under `auth`. More generally, it adds our apikey and org id from the session to sign each request and adds the API url, as set in our `config.yaml` file, and **always** returns JSON. The file itself is heavily commented for what each part does specifically but as an overview, if the **Express App** wants to talk to the **Core API**, it goes through the relay.

#### Sessioning with LevelDB

The app keeps track of whether a user is logged in by setting a cookie on the person's browser with a **Session ID**.The **Session ID** stores the user's api key in a LevelDB database, which is written out to the [`lib/db/`](lib/db/) folder. 

This whole process is largely abstracted thanks to the use of two libraries: 

1. [express-session](https://www.npmjs.com/package/express-session) handles communicating with the browser's cookies
2. [level-session-store](https://www.npmjs.com/package/level-session-store) handles putting our sessions in the database.

This process is configured in [`lib/app.js`](lib/app.js). We include a flag for storing the session securely if we are in an https production environment, which is set as explained above in [Getting started](#Getting-started).

````js
var sessInfo = {
  store: new LevelStore(path.join(__dirname, 'db')),
  secret: NEWSLYNX_CONFIG.newslynx_app_secret_key,
  resave: true,
  saveUninitialized: true,
  unset: 'destroy',
  cookie: {secure: false}
};

// If we are running in a secure environment
if (app.get('env') === 'https' || NEWSLYNX_CONFIG.https === true) {
  app.set('trust proxy', 1) // Trust the first proxy
  sessInfo.cookie.secure = true
}
````

#### Bootstrapping and transforming data

Currently, on initial load for any of your main **Pages**, the Express app will make a bunch of calls to the API and package up this data as a global data object called `pageData`. You can see how all this plays out in the [`lib/routes/pages.js`](lib/routes/pages.js) file. 

We currently [have an open issue](https://github.com/newslynx/opportunities/issues/25) to change this pattern so that Backbone collections fetch their own data on load. The advantage with this change is that the user will see the page change more quickly than with the current setup. For example, from the Home screen, if you click "Approval River," that data is all fetched asynchronously by the Express app but then your browser loads it all in one big object, which is why you hang on that Loading gif of Merlynne making potions a few seconds.

We built it this way, essentially, because that's the way we first set it up. The **benefit** of doing it this way is we are also doing a number of transformations on the data and the fact that we serialize the JSON data (i.e. convert it to a string and then back out to JSON) lets us not worry about mutating data in unexpected ways (because objects are passed by reference, not duplicated in JavaScript, you can easily modify an object in one place and unexpectedly see those changes reflected in elsewhere as well).

For example, our articles come back from the server with a list of **Subject tag ids**. We then [hydrate](lib/utils/transform.js#L68) these ids with the full subject tag info. If we weren't careful, we would really only have one copy of this object instead of multiple. The consequence of that is if we delete a subject tag off of one article, it would be removed from every article. 

This problem is not insurmountable, but I explain it here to point out some of the advantages of the current system and things to keep in mind for shifting to another system.

All of the transformations are stored in [`lib/utils/transform.js`](lib/utils/transform.js)

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


