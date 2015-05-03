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
var environment = require('./settings');
var utils = require('./utils')
var routes = require('./routes');
var organizations = require('./routes/organizations');

var yaml = require('js-yaml');
var expandHomeDir = require('expand-home-dir')
var compression = require('compression')
// Redis for persisting user sessions
var RedisStore = require("connect-redis")(session);

var app = express();

var debug = require('tracer').console();
var newslynx_config_path = process.env.NEWSLYNX_CONFIG_FILE || expandHomeDir('~/.newslynx/config.yaml');
var NEWSLYNX_CONFIG = yaml.load(fs.readFileSync(newslynx_config_path, 'utf-8'));

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
	secret: NEWSLYNX_CONFIG.newslynx_app_secret_key
}));
app.use(stylus.middleware({
	debug: true,
	src: path.join(__dirname, 'public'),
	compile: function(str, path){
	return stylus(str)
		.set('filename', path)
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
var non_auth_routes = ['login', 'about', 'images', 'stylesheets', 'data', 'javascripts', 'auth'];
app.use(function(req, res, next){
	var parts = req.path.split('/');
	if ( non_auth_routes.indexOf(parts[1]) != -1 ) {
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

environment.apply(app);

module.exports = app;
