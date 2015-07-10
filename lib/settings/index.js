var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var NEWSLYNX_CONFIG = require('./config');

function here() {
	segments = _.toArray(arguments);
	return path.join.apply(null, [__dirname].concat(segments));
}

function load(filename) {
	return JSON.parse(fs.readFileSync(here(filename)));
}


// var errors = load('errors.js');
// module.exports = errors;
module.exports.config = NEWSLYNX_CONFIG;
module.exports.apply = function(app) {
	require('./errors.js')(app);
}