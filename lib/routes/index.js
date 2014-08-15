var express = require('express');
var router = express.Router();
var fs = require('fs');
var passport = require('passport');
var async = require('async');
var app = require('../app');
var settings = require('../settings');
var auth = require('../utils/auth');

function readFileAsUtf8(path, cb){
	fs.readFile(path, 'utf-8', cb);
}

function readFileAsJson(path, cb){
	fs.readFile(path, 'utf-8', function(err, result){
		cb(null, JSON.parse(result));
	});
}

function sanitize(title){
	return title.toLowerCase().replace(/ /g, '-');
}

/* GET home page. */
router.get('/', function(req, res) {
	var info = {};
	// Account information
	info.req = req;
	// Page information
	info.title = 'Home';
	info.page = sanitize(info.title);
  res.render('index', info);
});

router.get('/about', function(req, res) {
	var info = {};
	// Account information
	info.req = req;
	// Page information
	info.title = 'About';
	info.page = sanitize(info.title);
  res.render('about', info);
});

router.get('/approval-river', function(req, res) {
	var info = {};
	// Account information
	info.req = req;
	// Page information
	info.title = 'Approval River';
	info.page = sanitize(info.title);
	// Fetch data
	async.map(['lib/public/data/account-data/org.json', 'lib/public/data/common-data-models/recipe-models.json', 'lib/public/data/account-data/account-recipes.json', 'lib/public/data/account-data/account-alerts.json'], readFileAsJson, function(err, results){
		// Data
		info.org  = results[0];
		info.recipeSchemas  = results[1];
		info.accountRecipes = results[2];
		info.riverItems    = results[3];
		
	  res.render('approval-river', info);
	});
});

router.get('/articles', function(req, res) {
	var info = {};
	// Account information
	info.req = req;
	// Page information
	info.title = 'Articles';
	info.page = sanitize(info.title);
	// Fetch data
	async.map(['lib/public/data/account-data/org.json','lib/public/data/account-data/account-articles-summary.json','lib/public/data/account-data/account-articles-detailed.json','lib/public/data/event-schemas.json'], readFileAsJson, function(err, results){
		// Data
		info.org = results[0];
		info.articleSummaries  = results[1];
		info.articleDetails = results[2];
		info.eventSchemas = results[3];
	  res.render('articles', info);
	});
});

router.get('/settings', function(req, res) {
	var info = {};
	// Account information
	info.req = req;
	info.redirected = req.query.redirected;
	info.oAuthFailed = info.redirected && !req.user.oAuthTokens.length;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);
	async.map(['lib/public/data/account-data/org.json'], readFileAsJson, function(err, results){
	// async.map(['localhost:30001/organizations/'+req.user.domain], readFileAsUtf8, function(err, results){
		// info.settingsSchema = results[0];
		
		// keep fixture in there for now alongside the real
		// organization object, while we complete the transition
		// to the latter
		//info.org = results[0];
		info.org = req.user;
		// console.log('log',info.req.user)
	  res.render('settings', info);
	});
});

router.all('/api/*', function(req, res){
  auth.relay(req, res);
});

router.get('/auth/google', function(req, res) {
	res.redirect(settings.api + '/tokens/google');
});

module.exports = router;
