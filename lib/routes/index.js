var express = require('express');
var router = express.Router();
var app = require('../app');
var fs = require('fs');
var passport = require('passport');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Home', page: 'home' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About', page: 'about' });
});

router.get('/approval-river', function(req, res) {
  res.render('approval-river', { title: 'Approval river', page: 'approval-river' });
});

router.get('/articles', function(req, res) {
  res.render('articles', { title: 'Articles', page: 'articles' });
});

router.get('/series', function(req, res) {
  res.render('series', { title: 'Series', page: 'series' });
});

router.get('/events', function(req, res) {
  res.render('events', { title: 'Events', page: 'events' });
});



// router.get('/article', function(req, res){
//   var opts = {};
//   opts.title = 'Article page';
//   opts.tags = ['social', 'major-event', 'citation']
//   opts.events = [
// 		{
// 			"title": "event1",
// 			"description": "Lorem ipsum doler sit amet consectueuer.",
// 			"tags": ['social', 'major-event']
// 		},
// 		{
// 			"title": "event2",
// 			"description": "The carbon in our apple pies billions upon billions cosmos.",
// 			"tags": ['citation']
// 		},
// 		{
// 			"title": "event3",
// 			"description": "By gravity a very small stage in a vast cosmic arena a mote of dust suspended in a sunbeam.",
// 			"tags": ['major-event']
// 		}
// 	]

//   res.render('article', opts);
// });

module.exports = router;
