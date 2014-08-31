var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

var debug = require('tracer').console();

exports.api = api = function(options, callback) {

  options.uri = settings.api + (options.uri || options.url);
  if (!options.json) options.json = true;
	debug.log('calling api: ' , options)

  // debug.log(options);
  request(options, function(error, response, body) {
  	if (error) { throw 'The API could not be reached. It might need to be turned off. ' + error }
		debug.log('Response received', body)
    callback(error, response.statusCode, body);
  });
}

exports.relay = relay = function(req, res, callback) {
	// var apikey = '',
	// 		query_delimiter = '?';

	// if (req.session.apikey){
	// 	if (req.url.indexOf('?') != -1) {
	// 		query_delimiter = '&';
	// 	}
	// 	apikey = query_delimiter + 'apikey=' + req.session.apikey;
	// }
  var options = {
    'internal': req.isInternal || false, 
    'method': req.method, 
    'uri': req.url.replace('/api', ''),
    'auth': req.session.auth
  }

  // If we have an apikey (everything but initial login), add that as a query parameter
	if (req.session.apikey) {
		options.qs = {
    	apikey: req.session.apikey
    }
	}

  // When logging in, data must be sent under `form`
  // But for all other requests, it should go through as `json`.
  if (!req.session.apikey) options.form = req.body;
  else options.json = req.body;


  api(options, function(error, status, body) {
    if (callback) {
      callback(error, status, body);
    } else {
    	// debug.log('Sending json response');
    	// debug.log('Status code:', status);
    	// debug.log('Length:', body.results.length);
    	// debug.log('Data:', body);
      res.json(status, body);
    }
  });
}