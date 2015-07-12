var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var NEWSLYNX_CONFIG = require('./config');


var env = process.env.NEWSLYNX_ENV || 'dev';
var errors = require('./errors.js');
module.exports = errors;
module.exports.env = env;
module.exports.config = NEWSLYNX_CONFIG;
module.exports.apply = function(app) {
	require('./errors.js')(app);
}