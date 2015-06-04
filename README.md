NewsLynx App
============

V2 of NewsLynx's Web App.  This is still a WIP and we should be officially open-sourcing the codebase in late June/July 2015

For now, please read [the report](http://towcenter.org/research/the-newslynx-impact-tracker-produced-these-key-ideas/) we published for the [TowCenter](http://towcenter.org) on our prototype.

#### Pro

If not already installed:

`npm install forever -g`

````bash
npm install
npm start
````

#### Debug mode

If not already installed:

`npm install nodemon -g`

````
npm run debug
````

Then visit: <http://0.0.0.0:3000>

#### Some useful things

Find all in project excluding uglified js

````
path/to/newslynx-app/lib,-*.bundled.js,-*.bundled.js.map
````
