var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var NEWSLYNX_CONFIG = require('./config');

// settings can consist of just plain variables, loaded from a JSON file, 
// but they can also be a JavaScript function that lives at `module.exports`
// and that receives app as its sole argument; the latter are applied when 
// `settings.apply(app)` is called in app.js

function here() {
	segments = _.toArray(arguments);
	return path.join.apply(null, [__dirname].concat(segments));
}

function load(filename) {
	return JSON.parse(fs.readFileSync(here(filename)));
}

environment = process.env.NODE_ENV || 'development';
shared = load('shared.json');
specific = load(environment + '.json');
module.exports = _.extend(shared, specific);
module.exports.name = environment;
module.exports.config = NEWSLYNX_CONFIG;
module.exports.api = NEWSLYNX_CONFIG.newslynx_api_url || 'http://localhost:5000';
module.exports.apply = function(app) {
	require('./shared.js')(app);
	require('./' + environment + '.js')(app);
}