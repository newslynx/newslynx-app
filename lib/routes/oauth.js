var _ = require('underscore');
var express = require('express');
var request = require('request');
var router = express.Router();
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var models = require('../models');


/* constants */
var GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth'
var GOOGLE_REVOKE_URI = 'https://accounts.google.com/o/oauth2/revoke'
var GOOGLE_TOKEN_URI = 'https://accounts.google.com/o/oauth2/token'


function callback (accessToken, refreshToken, profile, done) {
  console.log(refreshToken);
  models.Token.create({name: 'google', value: refreshToken}).complete(function(err, token){
    endpoint = 'https://www.googleapis.com/analytics/v3/management/accounts'
    oauth = {
      clientID: process.env['GOOGLE_ANALYTICS_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_ANALYTICS_CLIENT_SECRET'],
      token: accessToken
    }
    request.get({url: endpoint, oauth: oauth, json: true}, function(err, raw, body){
      // I'm not quite sure if account names always reflect a domain...
      domains = _.pluck(body.items, 'name');
      domains.push(body.username.split('@')[1]);
      models.Organization.find({where: {domain: domains}}).complete(function(err, organization) {
        organization.addToken(token).complete(function(err){
          done(null);
        });
      });
    });
  });
}


OAuth2Strategy.prototype.authorizationParams = function(options) {
  return {
    access_type: 'offline'
  }
}


var oauth = new OAuth2Strategy({
    authorizationURL: GOOGLE_AUTH_URI,
    tokenURL: GOOGLE_TOKEN_URI,
    clientID: process.env['GOOGLE_ANALYTICS_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_ANALYTICS_CLIENT_SECRET'],
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }, callback);


passport.use('google-oauth', oauth);

router.get('/auth/google', passport.authenticate('google-oauth', {
  scope: 'https://www.googleapis.com/auth/analytics.readonly'
}));

router.get('/auth/google/callback', passport.authenticate('google-oauth', {
  successRedirect: '/organizations/settings',
  failureRedirect: '/organizations/settings'
}));

module.exports = router;
