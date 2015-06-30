NewsLynx App
============

V2 of NewsLynx's Web App.  This is still a WIP and we should be officially open-sourcing the codebase in late July 2015

For now, please read [the report](http://towcenter.org/research/the-newslynx-impact-tracker-produced-these-key-ideas/) we published for the [TowCenter](http://towcenter.org) on our prototype.

## Installation

Install dependencies with `npm install`. You'll also need Redis for sessioning, which you can [brew](http://brew.sh) install with `brew install redis`. Start Redis by typing `redis-server` on the command line.

### Development mode

Install `nodemon` and `forever` globally if not already installed.

````bash
npm install forever -g
npm install nodemon -g
````

Run with 

````bash
npm run debug
````

### Production mode

Install `forever` globally if not already installed.

````bash
npm install forever -g
````

#### Debug mode

If not already installed:

`npm install nodemon -g`

````bash
npm start
````

Then visit: <http://0.0.0.0:3000>

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


