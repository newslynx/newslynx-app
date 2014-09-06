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
    .defer(readFileAsJson, 'lib/public/data/account-data/account-articles-summary.json')
    .defer(readFileAsJson, 'lib/public/data/account-data/account-articles-detailed.json')
    .defer(readFileAsJson, 'lib/public/data/event-schemas.json')
		.defer(sendToApi(req, res), '/api/organization/settings')
			.awaitAll(function(err, results){

				// Data
				info.impact_tag_categories = results[0];
				info.impact_tag_levels = results[1];
				info.subject_tags = results[2];
				info.impact_tags = results[3];
				var article_summaries  = results[4];
				var article_details = results[5];
				// info.articleDetails = results[5];
				info.eventSchemas = results[6];
				info.orgInfo = results[7];

				// The `article_summaries` object comes with a list of ids for tags, we need to rehydrate those with their fuller objects under [key + '_full']
				// For `article_summaries`, we have these stored under top level keys, listed as the third parameter, which tells the fn where to look
				article_summaries = utils.transform.hydrateTagsInfo(article_summaries, info, ['impact_tags', 'subject_tags']);

				// TODO, we will be fetching article details from the api so this transformation will be done inside the collection
				article_details   = utils.transform.hydrateTagsInfo(article_details, info, ['subject_tags']);
				// Impact tags are stored on each event and so we want to hydrate those objects for each article
				article_details.forEach(function(articleDetail){
					articleDetail.events   = utils.transform.hydrateTagsInfo(articleDetail.events, info, ['impact_tags']);
					// Add the impact category and level info on the parent for all of the events
					var impact_tags_full      = _.chain(articleDetail.events).pluck('impact_tags_full').flatten().uniq().value();
					// Hydrate these categories and levels with full data
					var impact_tag_categories = _.chain(articleDetail.events).pluck('impact_tag_categories').flatten().uniq().map(function(category){ console.log(info.impact_tag_categories); return _.findWhere(info.impact_tag_categories, {name: category}) }).value();
					var impact_tag_levels     = _.chain(articleDetail.events).pluck('impact_tag_levels').flatten().uniq().map(function(level){ return _.findWhere(info.impact_tag_levels, {name: level}) }).value();
					articleDetail['impact_tags_full'] 		 = impact_tags_full;
					articleDetail['impact_tag_categories'] = impact_tag_categories;
					articleDetail['impact_tag_levels'] 		 = impact_tag_levels;
				});

				// The API might return these and this function will become obsolete
				// This list of objects will need to be readded in the article comparison view however
				// similar to how we're nesting subject and impact tags
				article_summaries = utils.transform.addTopLevelQuantMetrics(article_summaries);

				// Add our hyrdated objects onto `info`
				info.articleSummaries = article_summaries;
				info.articleDetails   = article_details;
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
