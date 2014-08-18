var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

var debug = require('tracer').console();

exports.api = api = function(options, callback) {

  options.uri = settings.api + (options.uri || options.url);
  if (!options.json) options.json = true;
	// debug.log('calling api: ' , options)

  debug.log(options);
  request(options, function(error, response, body) {
  	if (error) throw 'The API could not be reached. It might need to be turned off. ' + error
    callback(error, response.statusCode, body);
  });
}

exports.relay = relay = function(req, res, callback) {
	var apikey = '';
	if (req.session.apikey) apikey = '/' + req.session.apikey;
  var options = {
    'internal': req.isInternal || false, 
    'method': req.method, 
    'uri': req.url.replace('/api', '') + apikey,
    'auth': req.session.auth
  }

  // When logging in this has to be put under form
  // But for all other json types it should go through as body
  if (!req.session.apikey) options.form = req.body;
  else options.json = req.body;


  api(options, function(error, status, body) {
    if (callback) {
      callback(error, status, body);
    } else {
    	debug.log('sending json response', status, body)
      res.json(status, body);
    }
  });
}