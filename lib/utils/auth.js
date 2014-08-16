var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

var logging = require('tracer').console();

exports.api = api = function(options, callback) {
	// console.log('options',options)
  // if (options.internal) {
  //   delete options.internal;
  //   options.auth = {
  //     user: process.env.NEWSLYNX_ADMIN_USER, 
  //     pass: process.env.NEWSLYNX_ADMIN_PASS
  //   }
  // }

  options.uri = settings.api + (options.uri || options.url);
  options.json = true;
	logging.log('calling api: ' , options)

  request(options, function(error, response, body) {
    callback(error, response.statusCode, body);
  });
}


exports.relay = relay = function(req, res, callback) {
  var options = {
    'internal': req.isInternal || false, 
    'method': req.method, 
    'uri': req.url.replace('/api', '') + '/' + req.session.apikey, 
    'form': req.body, 
    'auth': req.session.auth,
  }

  api(options, function(error, status, body) {
  	logging.log('is callback', callback)
    if (callback) {
      callback(error, status, body);
    } else {
      res.json(status, body);
    }
  });
}

/* passport.js helper functions */
// exports.setApiKey = function(apikey, password, done) {

//   var options = {
//     'method': 'get', 
//     'uri': '/organizations/' + apikey
//   }

//   logger.log('getting org', apikey, password)

//   if (done === undefined) {
//     var done = password;
//     options.internal = true;
//   } else {
//     options.auth = {
//       'user': domain, 
//       'pass': password
//     }
//   }

//   api(options, function(error, status, body) {
//   	// console.log(status)
//     if (status == 200) {
//       done(null, body);
//     } else {
//       done(null, false, {message: 'Incorrect username or password.'});
//     }
//   });
// }

// exports.serializeUser = function(organization, done) {
// 	logger.log(organization.domain, organization, organization.apikey)
//   done(null, organization.apikey);
// }

// exports.deserializeUser = function(apikey, done) {
// 	logger.log('deserialize', apikey)
//   exports.getOrganization(apikey, done);
// }