var fs = require('fs-plus');
var path = require('path');
var _ = require('underscore');
var config = require('./config');

var env = process.env.NEWSLYNX_ENV || 'dev';
var errors = require('./errors.js');
module.exports = errors;
module.exports.env = env;
module.exports.save = config.save;
module.exports.config = config.NEWSLYNX_CONFIG;
module.exports.apply = function(app) {
	require('./errors.js')(app);
}