NewsLynx App
============

V2 of NewsLynx's Web App.  This is still a WIP and we should be officially open-sourcing the codebase in late July 2015

For now, please read [the report](http://towcenter.org/research/the-newslynx-impact-tracker-produced-these-key-ideas/) we published for the [TowCenter](http://towcenter.org) on our prototype.

## Installation

Install dependencies with `npm install`. You'll also need Redis for sessioning, which you can [brew](http://brew.sh) install with `brew install redis`. Start Redis by typing `redis-server` on the command line.

Install `nodemon` and `forever` globally if not already installed. Nodemon isn't used in production but it's good to have to cover all scenarios below

````bash
npm install forever -g
npm install nodemon -g
````

### Production mode

Run with the following, which will run Redis in the background, compile your CSS and JS and run the server with forever.

````bash
npm start
````

Then visit: <http://0.0.0.0:3000>

#### Other npm commands (production scenarios and development)

* `npm run app` — Compile CSS + JS and run the app with forever. You will need to be running a redis server elsewhere. Use this scenario **in production** if you are running newslynx-core on the same box since that will handle running redis.
* `npm run dev` — Compile CSS + JS and watch for changes, run redis and run the server with nodemon, which will restart the server when you change jade and json files or the express app. Use this scenario when **developing locally**.
* `npm run dev-files` — Compile CSS + JS and watch for changes. Does no run the app. Use this scenario when **developing locally** in conjunction with the following command so you can see the output in two shell windows.
* `npm run dev-server` — Runs the server with nodemon and the same restart policy as above. Use in conjunction when **developing locally** with `npm run dev-files`.


## Documentation

This documentation will explain the architecture and design patterns in use in the Express app and each section's Backbone app.

### Express App architecture 

#### Authentication

#### Sessioning with Redis

#### Concatenating and Uglifying JavaScript

#### Transforming data

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

#### Some useful things

Find all in project excluding uglified js

````
path/to/newslynx-app/lib,-*.bundled.js,-*.bundled.js.map
````

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.


