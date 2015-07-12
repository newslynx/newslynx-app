var fs = require('fs');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var nib = require('nib');
var settings = require('./settings');
var NEWSLYNX_CONFIG = require('./settings').config;

var appRoutes = require('./routes');

var debug = require('tracer').console();
var compression = require('compression')

var LevelStore = require('level-session-store')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(favicon( path.join(__dirname, '/public/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
	store: new LevelStore(path.join(__dirname, 'db')),
	secret: NEWSLYNX_CONFIG.newslynx_app_secret_key,
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

	var parts = req.path.split('/'),
	    page = parts[1];

	if ( non_auth_routes.indexOf(page) !== -1 ) {

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

			debug.log('session',req.session)

			req.session.redirect_page = path
			// Persist this request after login for bookmarklet route
			if (path == '/articles/lookup'){
				url = req.query.url;
				req.session.redirect_url = path + '?url=' + url;
			}
			res.redirect('/login');
		}

	}
})

appRoutes.forEach(function(appRoute){
	app.use(appRoute);
})

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

settings.apply(app);

module.exports = app;
