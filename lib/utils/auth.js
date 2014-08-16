var _ = require('underscore');
var request = require('request');
var settings = require('../settings');

exports.api = api = function(options, callback) {
	// console.log('options',options)
  if (options.internal) {
    delete options.internal;
    options.auth = {
      user: process.env.NEWSLYNX_ADMIN_USER, 
      pass: process.env.NEWSLYNX_ADMIN_PASS
    }
  }

  options.uri = settings.api + (options.uri || options.url);
  options.json = true;
  request(options, function(error, response, body) {
    callback(error, response.statusCode, body);
  });
}

exports.relay = relay = function(req, res, callback) {
  var options = {
    'internal': req.isInternal || false, 
    'method': req.method, 
    'uri': req.url.replace('/api', ''), 
    'body': req.body, 
    'auth': req.session.auth, 
  }

  api(options, function(error, status, body) {
    if (callback) {
      callback(error, status, body);
    } else {
      res.json(status, body);
    }
  });
}

/* passport.js helper functions */
exports.getOrganization = function(domain, password, done) {
  var options = {
    'method': 'get', 
    'uri': '/organizations'
  }

  if (done === undefined) {
    var done = password;
    options.internal = true;
  } else {
    options.auth = {
      'user': domain, 
      'pass': password
    }    
  }

  // console.log('auth',options.auth)

  api(options, function(error, status, body) {
    if (status == 200) {
      done(null, body);
    } else {
      done(null, false, {message: 'Incorrect username or password.'});
    }
  });
}

exports.serializeUser = function(organization, done) {
  done(null, organization.domain);
}

exports.deserializeUser = function(domain, done) {
  exports.getOrganization(domain, done);
}