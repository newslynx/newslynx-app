/* modules */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var models = require('../models');


/* constants */
var GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth'
var GOOGLE_REVOKE_URI = 'https://accounts.google.com/o/oauth2/revoke'
var GOOGLE_TOKEN_URI = 'https://accounts.google.com/o/oauth2/token'


/* strategies */
var local = new LocalStrategy(models.Organization.verify)

OAuth2Strategy.prototype.authorizationParams = function(options) {
  return {
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    access_type: 'offline'
  }
}

var oauth = new OAuth2Strategy({
    authorizationURL: GOOGLE_AUTH_URI,
    tokenURL: GOOGLE_TOKEN_URI,
    clientID: process.env['GOOGLE_ANALYTICS_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_ANALYTICS_CLIENT_SECRET'],
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }, function(accessToken, refreshToken, profile, done) {
    // req.user.tokens.add('google-analytics', refreshToken);
    // req.user.save()
    process.nextTick(function(){
      console.log(accessToken, refreshToken);
      done(null);
    });    
});

exports.strategies = {
  local: local, 
  oauth: oauth
}