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
	auth.relay(req, res, function(err, status, body){
		var redirect_dest = '/',
				info;

		if (status == 200){
			req.session.apikey = body.apikey;
			req.session.org_id = body.orgs[0].id;

			if (req.session.redirect_to) {
				redirect_dest = req.session.redirect_to;
				req.session.redirect_to = null;
			}
			res.redirect(redirect_dest);
		} else {
			info = {title: 'Login', page: 'login', page: 'login', msg: 'Login failed ' + body.message};
			res.render('login', {info: info});
		}
	});
});

router.get('/logout', function(req, res){
	req.session.apikey = null;
	var info = {title: 'Login', page: 'login', page: 'login', msg: "You have successfully logged out."};
	res.render('login', {info: info});
});

// One main route for all communication to the api
router.all('/api/*', function(req, res){
  utils.auth.relay(req, res);
});

module.exports = router;
