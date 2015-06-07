var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

var debug = require('tracer').console();

exports.api = api = function(options, callback) {

  options.uri = settings.api + (options.uri || options.url);
  if (!options.json) {
  	options.json = true;
  }
	debug.log('Calling api: ' , options)

  request(options, function(error, response, body) {
  	if (error) { throw 'The API could not be reached. It might need to be turned off. ' + error}
    callback(error, response.statusCode, body);
  });
}

function addApiVersion(reqUrl){
  var versioned_url = reqUrl.replace('_VERSION', settings.config.api_version);
  return versioned_url;
}

exports.relay = relay = function(req, res, callback) {

  var versioned_url = addApiVersion(req.url);
	var options = {
		'internal': req.isInternal || false, 
		'method': req.method, 
		'uri': versioned_url,
		'auth': req.session.auth,
		'headers': {
      'Cache-Control': 'No-Cache',
  		// 'Accept-Encoding': 'gzip'
		}
  }

  // If we have an apikey (everything but initial login), add that as a query parameter
	if (req.session.apikey && req.session.org_id) {
		options.qs = {
			apikey: req.session.apikey,
      org: req.session.org_id
		}
	}

  // When logging in, data must be sent under `form`
  // But for all other requests, it should go through as `json`.
  if (!req.session.apikey) {
  	options.form = req.body;
  } else {
  	options.json = req.body;
  }


  api(options, function(error, status, body) {
    if (callback) {
      callback(error, status, body);
    } else {
    	// debug.log('Sending json response');
    	// debug.log('Status code:', status);
    	// debug.log('Length:', body.results.length);
    	// debug.log('Data:', body);
      // debug.log('printing', error, body)
      res.json(status, body);
    }
  });
}