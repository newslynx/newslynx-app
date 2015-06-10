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

function grantAccess(service){
	return function(req, res) {
		res.redirect(settings.api + '/api/'+settings.config.api_version+'/auth/'+service+'/grant?apikey=' + req.session.apikey  + '&org=' + req.session.org_id + '&redirect_uri=' + req.headers.referer);
	}
}

function revokeAccess(service){
	return function(req, res) {
		var apiRequester = sendToApi(req,res),
				path = '/api/_VERSION/auth/'+service+'/revoke';

		apiRequester(path, function(err, response){
			debug.log(err, response);
			res.redirect('/settings');
		});

	}
}

function sanitize(title){
	return title.toLowerCase().replace(/ /g, '-');
}

function logNullResponse(err, results){
	if (!err) {
		debug.log(err);
	}

	results.forEach(function(result, index){
		if (!result) {
			debug.log('ERROR, null result at index:', index);
		}
	});

}

/* GET home page. */
router.get('/', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Home';
	info.page = sanitize(info.title);
  res.render('index', {info: info});
});

router.get('/about', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'About';
	info.page = sanitize(info.title);
  res.render('about', {info: info});
});

router.get('/settings', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req,res), '/api/_VERSION/me')
		.defer(sendToApi(req,res), '/api/_VERSION/settings')
		.defer(sendToApi(req,res), '/api/_VERSION/tags?sort=created')
		.defer(sendToApi(req,res), '/api/_VERSION/recipes?sort=created&sous_chefs=rss-feed-to-article,twitter-list-to-event,twitter-user-to-event,facebook-page-to-event')
		.defer(sendToApi(req,res), '/api/_VERSION/auths')
			.await(function(err, userInformation, orgSettings, tagsObj, recipesList, orgAuths){
				logNullResponse(err, [userInformation, orgSettings, tagsObj, recipesList, orgAuths]);

				info.org = utils.transform.turnSettingsListToDict(orgSettings, {id: req.session.org_id});
				// On initial account creation, these orgSettings will be totally blank, i.e. an empty list
				// To get everything bound properly to the UI, scaffold the `homepage` and the `timezone` values
				info.orgSettingsList = utils.transform.scaffoldDefaultSettings(orgSettings, ['homepage', 'timezone']);

				info.user = userInformation;

				info.tags = utils.transform.segregateTagTypes(tagsObj.tags);

				info.recipes = {
					all: recipesList.recipes
				};

				info.org.google_analytics_authed = utils.transform.hasObject(orgAuths, {name: 'google-analytics'});
				info.org.twitter_authed =  utils.transform.hasObject(orgAuths, {name: 'twitter'});
				info.org.facebook_authed =  utils.transform.hasObject(orgAuths, {name: 'facebook'});

				// Add the sous-chefs specified in our query parameters as keys on our `recipes` object through a groupBy
				utils.transform.extend(info.recipes, utils.transform.groupBy(recipesList.recipes, 'sous_chef'));

				res.render('settings', {info: info});
			});
});

router.get('/approval-river', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Approval River';
	info.page = sanitize(info.title);

	console.log(info.page)

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/_VERSION/tags/impact')
		.defer(sendToApi(req, res), '/api/_VERSION/sous-chefs')
		.defer(sendToApi(req, res), '/api/_VERSION/recipes')
		.defer(sendToApi(req, res), '/api/_VERSION/alerts?include_raw=true&count=25')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema-alert-data.json')
		.defer(sendToApi(req, res), '/api/_VERSION/articles?fields=id,title')
		.defer(sendToApi(req, res), '/api/_VERSION/settings/timezone')
			.await(function(err, impactTags, sousChefsInfo, recipesInfo, alertsList, defaultEventSchema, alertFieldsSchema, articlesList, timezoneSettingInfo){
				logNullResponse(err, [impactTags, sousChefsInfo, recipesInfo, alertsList, defaultEventSchema, alertFieldsSchema, articlesList, timezoneSettingInfo]);

				// Data

				// `defaultEventSchema` is all things that you can know ahead of time (before an alert is created), like article assignee, tag etc.
				// `alertFieldsSchema` is the things you don't know on the alert: timestamp, text, link — things that come from an alert.

				// Add full tags to the default event schema
				defaultEventSchema.impact_tags.options = impactTags;
				var sous_chefs = sousChefsInfo.sous_chefs;

				// Add the default event schema to each sous chef
				var sous_chefs_with_default_event_schema = utils.transform.populateSousChefsWithDefaultEvent(sous_chefs, defaultEventSchema);

				// Extend the event creator schema, which by default is just some info about alerts like `link`, `timestamp`, and `text`
				// With this default event, which will have tags and things
				var event_schema_full = utils.transform.extend(alertFieldsSchema, defaultEventSchema);

				// Give the client access to these
				info.eventCreatorSchema = event_schema_full;
				info.sousChefs  = sous_chefs_with_default_event_schema;
				info.recipes = recipesInfo.recipes;
				info.alerts = alertsList;

				// Timezone
				info.timezone = timezoneSettingInfo.value;


				debug.log(info)

				// // Data
				// var impact_tags 			= results[0];
				// var recipe_schemas	 	= results[1];
				// // What are our already created recipes
				// var account_recipes   = results[2];
				// // What are all our alerts?
				// info.alerts           = results[3];

				// // Save this for article
				// info.articleSkeletons = results[6];

				// // `default_event_schema` is all things that you can know ahead of time, like article assignee, tag etc.
				// var default_event_schema	= results[4];
				// // `alert_fields_schema` is the things you dont know, timestamp, text, link. Things that come from an alert
				// var alert_fields_schema	= results[5];

				// // Add full tags to the default event schema
				// default_event_schema.impact_tags.options = impact_tags;

				// // Add the default event schema to each recipe schema
				// recipe_schemas = utils.transform.populateRecipeSchemasWithDefaultEvent(recipe_schemas, default_event_schema);

				// // Extend the event creator schema, which by default is just some info about alerts like `link`, `timestamp`, and `text`
				// // With this default event, which will have tags and things
				// var event_schema_full = utils.transform.extend(alert_fields_schema, default_event_schema);

				// // Give the client access to these
				// info.eventCreatorSchema = event_schema_full;
				// info.recipeSchemas  = recipe_schemas;
				// info.accountRecipes = account_recipes;

				// // Timezone
				// info.timezone = results[7].timezone;

				res.render('approval-river', {info: info});
			});
});

router.get('/articles', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Articles';
	info.page = sanitize(info.title);

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/_VERSION/tags/impact/attributes/categories')
		.defer(sendToApi(req, res), '/api/_VERSION/tags/impact/attributes/levels')
		.defer(sendToApi(req, res), '/api/_VERSION/tags/subject')
		.defer(sendToApi(req, res), '/api/_VERSION/tags/impact')
		.defer(sendToApi(req, res), '/api/_VERSION/articles')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema-alert-data.json')
		.defer(sendToApi(req, res), '/api/_VERSION/articles/comparisons') 
		.defer(readFileAsJson, 'lib/public/data/common-data-models/tag-attribute-colors.json')
		.defer(sendToApi(req, res), '/api/_VERSION/organization/settings') // Replace this with timeone endpoint
		.defer(readFileAsJson, 'lib/public/data/common-data-models/article-schema.json')
			.awaitAll(function(err, results){
				logNullResponse(err, results);
				// Data
				var impact_tag_categories		= results[0];
				var impact_tag_levels 			= results[1];
				var attribute_color_lookup	= results[8];

				// Add colors to impact categories and levels
				info.impact_tag_categories = utils.transform.addColors(impact_tag_categories, attribute_color_lookup);
				info.impact_tag_levels 		 = utils.transform.addColors(impact_tag_levels, attribute_color_lookup);
				info.attributeColorLookup  = attribute_color_lookup;

				var subject_tags = results[2];
				var impact_tags = results[3];
				var article_summaries  = results[4];

				var tag_info = {
					subject_tags: subject_tags,
					impact_tags: impact_tags
				};

				info.subject_tags = subject_tags;

				var event_schema		        = results[5];
				var event_schema_alert_data	= results[6];

				event_schema.impact_tags.options = impact_tags;
				var event_schema_full = utils.transform.extend(event_schema_alert_data, event_schema);

				info.eventCreatorSchema = event_schema_full;
				info.impact_tags = impact_tags;
				info.articleComparisons = results[7];

				article_summaries = utils.transform.addTopLevelQuantMetrics(article_summaries);
				article_summaries = utils.transform.hydrateTagsInfo(article_summaries, tag_info, ['subject_tags', 'impact_tags']);

				// Add our metrics onto `info`
				info.articleSummaries = article_summaries;

				// Timezone
				info.timezone = results[9].timezone;

				var add_article_schema = results[10];
				add_article_schema.subject_tags.options = subject_tags;

				info.addArticleSchema = add_article_schema;

				res.render('articles', {info: info});
			});
});

router.get('/articles/lookup', function(req, res){
	var url = req.query.url;

	if (url){
		queue()
			.defer(sendToApi(req, res), '/api/_VERSION/articles/lookup?url='+url)
			.awaitAll(function(err, results){
				var id = results[0].id,
						info;

				if (id){
					res.redirect('/articles#detail/'+id);
				} else {
					info = {title: 'Login', page: 'login', page: 'login', msg: 'Article lookup failed! NewsLynx doesn\'t have a page for that article.'};
					res.render('login', {info: info});
				}
			})
		
	}

});

router.all('/api/*', function(req, res){
	debug.log('relaying')
  utils.auth.relay(req, res);
});

// Authentications
router.get('/auth/google-analytics/grant', grantAccess('google-analytics') );
router.get('/auth/twitter/grant', grantAccess('twitter') );
router.get('/auth/facebook/grant', grantAccess('facebook') );

// Revoke auths
router.get('/auth/google-analytics/revoke', revokeAccess('google-analytics') );
router.get('/auth/twitter/revoke', revokeAccess('twitter') );
router.get('/auth/facebook/revoke', revokeAccess('facebook') );


module.exports = router;
