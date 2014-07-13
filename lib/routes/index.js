var express = require('express');
var router = express.Router();
var app = require('../app');
var fs = require('fs');
var passport = require('passport');
var async = require('async');

function readFileAsUtf8(path, cb){
	fs.readFile(path, 'utf-8', cb);
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Home', page: 'home' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About', page: 'about' });
});

router.get('/approval-river', function(req, res) {
	var info = {};
	// Page information
	info.title = 'Approval River';
	info.page = 'approval-river';
	// Fetch data
	async.map(['lib/public/data/alert-schemas.json', 'lib/public/data/account-alerts.json', 'lib/public/data/approval-river-items.json'], readFileAsUtf8, function(err, results){
		// Data
		// I feel like there's a better way to do this than with array indices. It's nice how `async.series` returns keys.
		info.alertSchemas  = results[0];
		info.accountAlerts = results[1];
		info.riverItems    = results[2];
	  res.render('approval-river', info);
	});
});

router.get('/articles', function(req, res) {
	var info = {};
	// Page information
	info.title = 'Articles';
	info.page = 'articles';
	// Fetch data
	async.map(['lib/public/data/org.json','lib/public/data/article-summaries.json','lib/public/data/article-details.json'], readFileAsUtf8, function(err, results){
		// Data
		info.org = results[0];
		info.articleSummaries  = results[1];
		info.articleDetails = results[2];
	  res.render('articles', info);
	});
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
