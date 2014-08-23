var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var queue = require('queue-async');
var app = require('../app');
var settings = require('../settings');
var utils = require('../utils');
var request = require('request');
var debug = require('tracer').console();

function readFileAsUtf8(path, cb){
	fs.readFile(path, 'utf-8', cb);
}

function readFileAsJson(path, cb){
	fs.readFile(path, 'utf-8', function(err, result){
		cb(null, JSON.parse(result));
	});
}

function sendToApi(req,res){
	return function(path, cb){
		req.url = path;
		utils.auth.relay(req, res, function(err, status, body){
			cb(err, body);
		});
	}
}

function sanitize(title){
	return title.toLowerCase().replace(/ /g, '-');
}

/* GET home page. */
router.get('/', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Home';
	info.page = sanitize(info.title);
  res.render('index', info);
});

router.get('/about', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'About';
	info.page = sanitize(info.title);
  res.render('about', info);
});

router.get('/approval-river', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Approval River';
	info.page = sanitize(info.title);
	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/organization/settings')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/recipe-schemas.json')
		.defer(sendToApi(req, res), '/api/recipes')
		.defer(readFileAsJson, 'lib/public/data/account-data/account-alerts.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.awaitAll(function(err, results){

			// Data
			info.org  					= results[0];
			info.recipeSchemas  = results[1];
			info.accountRecipes = results[2];
			info.riverItems     = results[3];
			var event_schema		 = results[4];

			// Add a list of tag names to the default event schema
			event_schema = utils.transform.populateDefaultEventWithTags(results[0].impact_tags, event_schema);
			// Add this schema to each recipe schema
			info.recipeSchemas = utils.transform.populateRecipeSchemasWithDefaultEvent(info.recipeSchemas, event_schema);

		  res.render('approval-river', info);
		});
});

router.get('/articles', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Articles';
	info.page = sanitize(info.title);
	// Fetch data
	async.map([
    'lib/public/data/account-data/org.json',
    'lib/public/data/account-data/account-articles-summary.json',
    'lib/public/data/account-data/account-articles-detailed.json',
    'lib/public/data/event-schemas.json'], 
    readFileAsJson, function(err, results){

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
	info.apikey = req.session.apikey;
	// info.redirected = req.query.redirected;
	// info.oAuthFailed = info.redirected && !req.user.oAuthTokens.length;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);
	queue()
		.defer(sendToApi(req,res), '/api/organization/settings')
		.awaitAll(function(err, results){
			info.org = results[0];
			res.render('settings', info);
		});
});

router.all('/api/*', function(req, res){
  utils.auth.relay(req, res);
});

router.get('/auth/google', function(req, res) {
	res.redirect(settings.api + '/auth/google/' + req.session.apikey);
});

router.get('/auth/twitter', function(req, res) {
	res.redirect(settings.api + '/auth/twitter/' + req.session.apikey);
});

module.exports = router;
