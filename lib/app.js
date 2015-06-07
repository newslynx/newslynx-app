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
var RedisStore = require("connect-redis")(session);

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
	store: new RedisStore({ host: 'localhost', port: 6379, prefix: 'newslynx_app-' }),
	secret: NEWSLYNX_CONFIG.newslynx_app_secret_key,
	resave: true,
	saveUninitialized: true
}));
app.use(stylus.middleware({
	debug: true,
	src: path.join(__dirname, 'public/stylesheets'),
	compile: function(str, stylusPath){
		return stylus(str)
			.set('filename', stylusPath)
			.set('dest', path.join(__dirname, 'public/stylesheets/css'))
			.set('compress', false)
			.use(nib());
	}
}));
app.use(compression());

function allJsFiles(dirs){
	var files = [];
	dirs.forEach(function(dir){
		var js;
		if (dir.substr(dir.length - 3, dir.length) != '.js'){
			js = fs.readdirSync(dir).filter(function(file) { return file.substr(file.length-3,file.length) == '.js' }).map(function(file){ return dir +  '/' + file });
		} else {
			js = dir;
		}
		files = files.concat(js);
	})
	return files;
}

var js_assets = [
		'lib/public/javascripts/namespace.js',
		'lib/public/javascripts/helpers',
		'lib/public/javascripts/models',
		'lib/public/javascripts/collections',
		'lib/public/javascripts/app',
		'lib/public/javascripts/views',
		'lib/public/javascripts/routing',
		'lib/public/javascripts/init.js'
	];

var js_files = allJsFiles(js_assets);

var result = UglifyJS.minify(js_files, {
    outSourceMap: "main.bundled.js.map",
    mangle: false,
    output: {
    	beautify: true
    },
    compress: false
	});

fs.writeFile('lib/public/javascripts/main.bundled.js.map', result.map, function(err){
	if (err) console.log(err)
	console.log('JavaScripts... Source mapped.')
});

fs.writeFile('lib/public/javascripts/main.bundled.js', result.code, function(err){
	if (err) console.log(err)
	console.log('JavaScripts... Bundled.')
});

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
	if ( _.contains(non_auth_routes, parts[1]) ) {
		next();
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
