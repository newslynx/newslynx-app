var request = require('request');
var settings = require('../settings');

/* passport.js helper functions */
exports.getOrganization = function(domain, password, done) {
  if (done === undefined) {
    var done = password;
    var username = 'newslynx.org';
    var password = 'secret';
  } else {
    var username = domain;
  }



  var options = {
    'uri': settings.api + '/organizations/' + domain, 
    'auth': {
      'user': username, 
      'pass': password
    }, 
    'json': true
  }

  request.get(options, function(error, response, body) {
    if (response.statusCode == 200) {
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