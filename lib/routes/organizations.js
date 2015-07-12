/*
 * Routes for logging in and out
 * as well as a full-relay to the api endpoint for any route starting with `/api/`
*/

var router = require('express').Router();

var settings = require('../settings');
var debug = require('tracer').console();
var auth = require('../utils/auth');

router.get('/login', function(req, res){
	var apikey;
	if (req.session.apikey) {
		apikey = req.session.apikey;
	};

	var info = {title: 'Login', page: 'login', apikey: apikey, page: 'login'}
  res.render('login', {info: info});
});

router.post('/auth/_VERSION/login', function(req, res){
	var redirect_url = req.session.redirect_url || req.body.redirect_url || '/';

	if (req.session.redirect_page){
		redirect_url = redirect_url.replace('/login', req.session.redirect_page)
	}

	// Persist cookie if so desired
	if (req.body.remember_me === 'on'){
		req.session.cookie.maxAge = new Date().getTime();
	}

	auth.relay(req, res, function(err, status, body){
		var info;

		if (status == 200){
			req.session.apikey = body.apikey;
			req.session.org_id = body.orgs[0].id;

			if (req.session.redirect_url) {
				req.session.redirect_url = null;
			}
			res.redirect(redirect_url);
		} else {
			info = {title: 'Login', page: 'login', page: 'login', msg: 'Login failed ' + body.message};
			res.render('login', {info: info});
		}
	});
});

router.get('/logout', function(req, res){
	req.session.destroy()
	var info = {title: 'Login', page: 'login', page: 'login', msg: "You have successfully logged out."};
	res.render('login', {info: info});
});

// One main route for all communication to the api
router.all('/api/*', function(req, res){
  auth.relay(req, res);
});

module.exports = router;
