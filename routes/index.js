var express = require('express');
var router = express.Router();
var app = require('../app');
var fs = require('fs');
var passport = require('passport');

router.get('/login', function(req, res){
    res.render('login', {});
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login', 
}));

/* 
Eventually, we will want to allow users to browse NewsLynx both 
as a logged-in user, or anonymously. Both groups would simply see
different information. However, for the time being, any route 
can be protected using `passport.authenticate('basic')` as a 
middleware.
*/

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/article', function(req, res){
  var opts = {};
  opts.title = 'Article page';
  opts.tags = ['social', 'major-event', 'citation']
  opts.events = [
		{
			"title": "event1",
			"description": "Lorem ipsum doler sit amet consectueuer.",
			"tags": ['social', 'major-event']
		},
		{
			"title": "event2",
			"description": "The carbon in our apple pies billions upon billions cosmos.",
			"tags": ['citation']
		},
		{
			"title": "event3",
			"description": "By gravity a very small stage in a vast cosmic arena a mote of dust suspended in a sunbeam.",
			"tags": ['major-event']
		}
	]

  res.render('article', opts);
});

module.exports = router;
