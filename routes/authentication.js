module.exports = passport = require('passport');
passport.BasicStrategy = require ('passport-http').BasicStrategy;

/* Passport requires some configuration in order to allow for 
persistent sessions (using cookies). */
passport.serializeUser(function(organization, done) {
  done(null, organization.domain);
});

passport.deserializeUser(function(domain, done) {
  models.Organization.find(domain).success(function(err, organization) {
    done(err, organization);
  });
});

/* Basic authentication involves sending the password in plaintext, 
so it is important to always use HTTPS to protect the traffic. */
passport.use(new passport.BasicStrategy(function(username, password, done) {
  done(null, Organization.verify(username, password));
}