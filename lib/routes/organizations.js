/*
 * Routes for logging in and out
 * as well as a full-relay to the api endpoint for any route starting with `/api/`
*/

var fs = require('fs-plus');
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
	if (req.session.redirect_msg) {
		info.msg = 'Login failed ' + req.session.redirect_msg;
		req.session.redirect_msg = null
	}

  res.render('login', {info: info});
});

router.post('/auth/_VERSION/login', function(req, res){
	// This is a little messy in how we pick up the desired url, since we can be wanted to go to a few different pages
	// The main distinction is we sometimes go to pages like `/articles#detail`
	// and with our article lookup endpoint we sometimes want to go to things like `articles?url=<url>
	// If we have a full `redirect_url` stashed on the session then we'll go with that
	// If we have it on the body, it means we're picking it up from the login button
	var redirect_url = req.session.redirect_url || req.body.redirect_url || '/';

	// If we picked it up from the login button, we have to do one more thing
	// Saving the hash in the login button kept our hash information, but not the actual page wanted to go to
	// For example, if we went to `/artices#detail`, once we get to the login page, that string is `/login#detail`
	// Fortunately we have stored the page we wanted to go on our `req.session`. We can't store the hash on that 
	// Because the server never receives the hash. It thinks it's just a client-side thing
	// Computers, huh?
	if (req.body.redirect_url){
		redirect_url = redirect_url.replace('/login', req.session.redirect_page)
	}

	console.log('rrrr',redirect_url)

	// Persist cookie if so desired
	if (req.body.remember_me === 'on'){
		req.session.cookie.maxAge = new Date().getTime();
	}

	auth.relay(req, res, function(err, status, body){
		var info;

		if (status == 200){
			req.session.apikey = body.apikey;
			req.session.org_id = body.orgs[0].id;

			// Clear the redirect_url
			// So things are clean
			if (req.session.redirect_url) {
				req.session.redirect_url = null;
			}
			res.redirect(redirect_url);
		} else {
			req.session.redirect_url = redirect_url;
			req.session.redirect_msg = body.message;	
			res.redirect('/login');
		}
	});
});

router.get('/setup', function(req, res){
	var info = {title: 'Setup', page: 'setup', page: 'setup'};
	res.render('setup', {info: info});
});

router.post('/setup', function(req, res){
	var url = req.body.url,
			info;

	if (url) {
		settings.config.api_url = url;
		settings.save(settings.config);
		info = {title: 'Login', page: 'login', page: 'login'};
		res.render('login', {info: info})
	}

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
