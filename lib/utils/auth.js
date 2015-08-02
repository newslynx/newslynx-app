var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

// Pretty print our debug stamps
var debug = require('tracer').colorConsole({
  format : ["\033[36m{{timestamp}} (in {{file}}:{{line}}) \033[m  \n{{message}}",{error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"}],
  dateformat : "HH:MM:ss.L"
});

// This is the function that makes the request to the API endpoint
function api(options, callback) {

  // Prepend the API url to our options
  options.uri = settings.config.api_url + (options.uri || options.url);
  if (!options.json) {
  	options.json = true;
  }
	debug.log('Calling api: ' , options)

  // Actually make the request!
  request(options, function(error, response, body) {
  	if (error) { throw 'The API could not be reached. It might need to be turned off. ' + error}
    callback(error, response.statusCode, body);
  });
}

// All of our API endpoints include `_VERSION` where `v1` should be so that we can easily change the version number in `config.yaml`
// Here is the magical place where that replacement is made
function addApiVersion(reqUrl){
  var versioned_url = reqUrl.replace('_VERSION', settings.config.api_version);
  return versioned_url;
}

// Relay is where a number of API options are set
// Let's walk through them
function relay(req, res, callback) {
  // Turn our requested url into a versioned one
  var versioned_url = addApiVersion(req.url);

	var options = {
		'internal': req.isInternal || false, // I can't remember why we need this. It might be unnecessary. TO INVESTIGATE
		'method': req.method, // POST, PATCH, GET etc.
		'uri': versioned_url, // Where are we going?
		'auth': req.session.auth, // We set this when we are initially logging in
		'headers': {
      'Cache-Control': 'No-Cache' // Don't cache results from the API. The API handles its own cacheing so you don't have to worry about hitting it too many times
		},
    'gzip': true
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


  // Call our API through the `api` function above
  // Which will add our actual api endpoint url
  api(options, function(error, status, body) {
    if (callback) {
      callback(error, status, body);
    } else {
    	// debug.log('Sending json response');
    	// debug.log('Status code:', status);
    	// debug.log('Length:', body.results.length);
    	// debug.log('Data:', body);
      // debug.log('printing', error, body)

      // Always return a JSON response from the API
      res.json(status, body);
    }
  });
}

// This function is an ExpressJS middleware decorate around a `queue()` argument
// It's used in `lib/routes/pages.js`, `lib/routes/authentications.js` 
function sendToApi(req,res){
  return function(filePath, cb){
    req.url = filePath;
    relay(req, res, function(err, status, body){
      cb(err, body);
    });
  }
}


module.exports = {
  api: api,
  relay: relay,
  sendToApi: sendToApi
}