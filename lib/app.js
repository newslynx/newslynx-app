var fs = require('fs');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var UglifyJS = require("uglify-js");
var nib = require('nib');
var settings = require('./settings');
var NEWSLYNX_CONFIG = settings.config;
var utils = require('./utils')
var routes = require('./routes');
var organizations = require('./routes/organizations');
var _ = require('underscore');

var debug = require('tracer').console();
var compression = require('compression')
// Redis for persisting user sessions
// var RedisStore = require("connect-redis")(session);
var LevelStore = require('level-session-store')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(favicon( path.join(__dirname, '/public/images/favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
	store: new LevelStore(path.join(__dirname,'db')),
	secret: 'secrets',
	resave: true,
	saveUninitialized: true
}));

app.use(compression());

// The client shouldn't cache these pages
app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'No-Cache');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// If not logged in or accessing a public file listed in one of the directories below, go to the login page
var non_auth_routes = ['login', 'auth', 'about', 'images', 'stylesheets', 'data', 'javascripts'];
app.use(function(req, res, next){
	var parts = req.path.split('/');
	var page = parts[1];
	if ( _.contains(non_auth_routes, page) ) {
		if (page === 'login' && req.session.apikey){
			res.redirect('/');
		}else {
			next();
		}
	} else {
		if (req.session.apikey) {
			next();
		} else {
			var path = req.path,
					url;
			// Persist this request after login for bookmarklet route
			if (req.path == '/articles/lookup'){
				url = req.query.url;
				req.session.redirect_to = path + '?url=' + url;
			}
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

settings.apply(app);

module.exports = app;
