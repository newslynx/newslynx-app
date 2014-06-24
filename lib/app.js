var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
passport.strategies = require('./utils/passport');
var stylus = require('stylus');
var nib = require('nib');
var settings = require('./settings');
var routes = require('./routes');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// auth setup
passport.use('local', passport.strategies.local);
passport.use('google-oauth', passport.strategies.oauth);
passport.serializeUser(models.Organization.serializeUser);
passport.deserializeUser(models.Organization.deserializeUser);

// middleware
app.use(favicon());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({secret: 'Belgian waffles'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(stylus.middleware({
  src: path.join(__dirname, '/public'),
  compile: function(str, path){
  	console.log('Compiling stylus...');
    return stylus(str)
      .set('filename', path)
      .set('compress', false)
      .use(nib());
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

environment.apply(app);
module.exports = app;
