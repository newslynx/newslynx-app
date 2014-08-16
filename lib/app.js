var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var stylus = require('stylus');
var nib = require('nib');
var environment = require('./settings');
var utils = require('./utils')
var routes = require('./routes');
var organizations = require('./routes/organizations');

var app = express();

var logging = require('tracer').console();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// auth setup
// passport.use(new LocalStrategy(utils.auth.getOrganization));
// passport.serializeUser(utils.auth.serializeUser);
// passport.deserializeUser(utils.auth.deserializeUser);

// middleware
app.use(favicon( path.join(__dirname, '/public/images/favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({secret: process.env.NEWSLYNX_APP_SECRET_KEY}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(stylus.middleware({
  src: path.join(__dirname, '/public'),
  compile: function(str, path){
    return stylus(str)
      .set('filename', path)
      .set('compress', false)
      .use(nib());
  }
}));

// If not logged in or accessing a public file listed in one of the directories below, go to the login page
var non_auth_routes = ['login', 'about', 'images', 'stylesheets', 'data', 'javascripts'];
app.use(function(req, res, next){
	var parts = req.path.split('/');
	if ( non_auth_routes.indexOf(parts[1]) != -1 ) {
		next();
	} else {
		if (req.session.apikey) {
			next();
		} else {
			// next();
			res.redirect('/login');
		}
	}
})

app.use(routes);
app.use(organizations);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

environment.apply(app);

module.exports = app;
