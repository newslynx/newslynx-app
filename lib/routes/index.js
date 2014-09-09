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

router.get('/settings', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req,res), '/api/organization/settings')
			.awaitAll(function(err, results){
				info.org = results[0];
				res.render('settings', info);
			});
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
		.defer(sendToApi(req, res), '/api/alerts')
		// .defer(readFileAsJson, 'lib/public/data/account-data/account-alerts.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema-alert-data.json')
			.awaitAll(function(err, results){
				debug.log(err)
				// Data
				info.org  					= results[0];
				info.recipeSchemas  = results[1];
				info.accountRecipes = results[2];
				info.alerts         = results[3];

				var event_schema		        = results[4];
				var event_schema_alert_data	= results[5];

				// Add a list of tag names to the default event schema
				event_schema = utils.transform.populateDefaultEventWithTags(results[0].impact_tags, event_schema);
				// Add this schema to each recipe schema
				info.recipeSchemas = utils.transform.populateRecipeSchemasWithDefaultEvent(info.recipeSchemas, event_schema);
				// Extend the event creator schema, which by default is just some info about alerts like `link`, `timestamp`, and `text`
				// With this default event, which will have tags and things
				info.eventSchema = utils.transform.populateEventCreatorSchemaWithDefaultEvent(event_schema_alert_data, event_schema);

				res.render('approval-river', info);
			});
});

router.get('/articles', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Articles';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/tags/impact/attributes/categories')
		.defer(sendToApi(req, res), '/api/tags/impact/attributes/levels')
		.defer(sendToApi(req, res), '/api/tags/subject')
		.defer(sendToApi(req, res), '/api/tags/impact')
		.defer(sendToApi(req, res), '/api/articles')
		.defer(readFileAsJson, 'lib/public/data/event-schemas.json')
		.defer(sendToApi(req, res), '/api/organization/settings')
			.awaitAll(function(err, results){
				debug.log(err)
				// Data
				info.impact_tag_categories = results[0];
				info.impact_tag_levels = results[1];
				info.subject_tags = results[2];
				info.impact_tags = results[3];
				var article_summaries  = results[4];
				info.eventSchemas = results[5];
				info.orgInfo = results[6];
				info.articleHeadlines = _.pluck(article_summaries, 'title');
				article_summaries = utils.transform.addTopLevelQuantMetrics(article_summaries);

				// Add our metrics onto `info`
				info.articleSummaries = article_summaries;
				res.render('articles', info);
			});
});

router.all('/api/*', function(req, res){
  utils.auth.relay(req, res);
});

router.get('/auth/google', function(req, res) {
	res.redirect(settings.api + '/auth/google?apikey=' + req.session.apikey);
});

router.get('/auth/twitter', function(req, res) {
	res.redirect(settings.api + '/auth/twitter?apikey=' + req.session.apikey);
});

module.exports = router;
