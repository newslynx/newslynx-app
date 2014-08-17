var express = require('express');
var passport = require('passport');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var request = require('request');
var router = express.Router();
var settings = require('../settings');
var debug = require('tracer').console();
var auth = require('../utils/auth');

router.get('/login', function(req, res){
	var apikey;
	if (req.session.apikey) apikey = req.session.apikey
  res.render('login', {title: 'Login', page: 'login', apikey: apikey, page: 'login'});
});

router.post('/login', function(req, res){
	auth.relay(req, res, function(err, status, body){
		if (status == 200 && body.success){
			req.session.apikey = body.apikey;
			res.redirect('/');
		} else {
			res.render('login', {title: 'Login', page: 'login', page: 'login', msg: 'Login failed! ' + body.message});
		}
	});
});

router.get('/auth/callback/:apikey', function(req, res){
	debug.log('hey im here')
	req.session.apikey = req.params.apikey;
	debug.log('apikey',req.params.apikey);
	res.redirect('/')
});

router.get('/logout', function(req, res){
	req.session.apikey = null;
	res.render('login', {title: 'Login', page: 'login', page: 'login', msg: "You have successfully logged out."});
})


module.exports = router;
