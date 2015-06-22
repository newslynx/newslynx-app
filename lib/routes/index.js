var express = require('express');
var router = express.Router();
var fs = require('fs');
var async = require('async');
var queue = require('queue-async');
var app = require('../app');
var settings = require('../settings');
var utils = require('../utils');
var request = require('request');
var debug = require('tracer').colorConsole({
  format : ["\033[36m{{timestamp}} (in {{file}}:{{line}}) \033[m  \n{{message}}",{error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"}],
	dateformat : "HH:MM:ss.L"
});
var chalk = require('chalk');

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
		res.redirect(settings.api + '/api/'+settings.config.api_version+'/auths/'+service+'/grant?apikey=' + req.session.apikey  + '&org=' + req.session.org_id + '&redirect_uri=' + req.headers.referer);
	}
}

function revokeAccess(service){
	return function(req, res) {
		var apiRequester = sendToApi(req,res),
				path = '/api/_VERSION/auths/'+service+'/revoke';

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
	if (err) {
		debug.log(err);
	}  else {
		console.log('')
		console.log(chalk.green(results.length + ' resources fetched successfully!'))
	}

	results.forEach(function(result, index){
		if (!result) {
			console.log(chalk.red('ERROR, null result at index:'), index);
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

router.get('/submit', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Submit';
	info.page = sanitize(info.title);
  res.render('submit', {info: info});
});

router.get('/settings', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	// Page information
	info.title = 'Settings';
	info.page = sanitize(info.title);

	info.defaultRecipeNames = {
		rss_feed_recipe_name: 'Ingest Articles from an RSS Feed',
		staff_twitter_list_to_promotion_recipe_name: 'Staff Twitter List to Promotion Event',
		staff_twitter_user_to_promotion_recipe_name: 'Staff Twitter User to Promotion Event',
		staff_facebook_page_to_promotion_recipe_name: 'Staff Facebook Page to Promotion Event'
	};

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/_VERSION/me')
		.defer(sendToApi(req, res), '/api/_VERSION/settings')
		.defer(sendToApi(req, res), '/api/_VERSION/tags?sort=created')
		.defer(sendToApi(req, res), '/api/_VERSION/recipes?sort=created&sous_chefs=rss-feed-to-article,twitter-list-to-event,twitter-user-to-event,facebook-page-to-event')
		.defer(sendToApi(req, res), '/api/_VERSION/auths')
			.await(function(err,    userInformation, orgSettings, tagsInfo, recipesList, orgAuths){
				logNullResponse(err, [userInformation, orgSettings, tagsInfo, recipesList, orgAuths]);

				// This will be useful to have in dictionary format
				info.org = utils.transform.turnSettingsListToDict(orgSettings, {id: req.session.org_id});
				// On initial account creation, these orgSettings will be totally blank, i.e. an empty list
				// To get everything bound properly to the UI, scaffold the `homepage` and the `timezone` values
				info.orgSettingsList = utils.transform.scaffoldDefaultSettings(orgSettings, ['homepage', 'timezone']);

				// Stash this info
				info.user = userInformation;
				// Break these up into two groups on an object
				info.tags = utils.transform.segregateTagTypes(tagsInfo.tags);

				// We'll make these all go on one object, grouped by slug
				info.recipes = {
					all: recipesList.recipes
				};

				var google_analytics_auth = utils.transform.hasObject(orgAuths, {name: 'google-analytics'});
				info.org.twitter_auth =  utils.transform.hasObject(orgAuths, {name: 'twitter'});
				info.org.facebook_auth =  utils.transform.hasObject(orgAuths, {name: 'facebook'});

				if (google_analytics_auth.is_authed){
					google_analytics_auth.properties = google_analytics_auth.auth_info.value.properties;
				}

				info.org.google_analytics_auth = google_analytics_auth;

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

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/_VERSION/tags?type=impact')
		.defer(sendToApi(req, res), '/api/_VERSION/sous-chefs?creates=events')
		.defer(sendToApi(req, res), '/api/_VERSION/recipes?creates=events&status=-inactive')
		.defer(sendToApi(req, res), '/api/_VERSION/events?status=pending&per_page=25&recipe_ids=1,7,8') // TODO, remove once better dummy data
		.defer(readFileAsJson,      'lib/public/data/common-data-models/event-schema.json')
		.defer(sendToApi(req, res), '/api/_VERSION/settings/timezone')
		.defer(sendToApi(req, res), '/api/_VERSION/events?provenance=manual&per_page=1')
		.defer(sendToApi(req, res), '/api/_VERSION/settings/timezone') // DUMMY, replace with comparison metrics endpoint
			.await(function(err,    impactTagsInfo, sousChefsInfo, recipesInfo, eventsInfo, eventSchema, timezoneSettingInfo, manualEventsInfo, comparisonMetrics){
				logNullResponse(err, [impactTagsInfo, sousChefsInfo, recipesInfo, eventsInfo, eventSchema, timezoneSettingInfo, manualEventsInfo, comparisonMetrics]);
				

				// TEMPORARY, fill with dummy content
				comparisonMetrics = {all: []};

				var impact_tags = impactTagsInfo.tags;

				// Nest all of these keys prefaced by `set_event_` under the key `set_event_options`
				// And add impact tags as an the `input_options`
				var sous_chefs_with_nested_set_event_schema = utils.transform.addImpactTags(sousChefsInfo.sous_chefs, impact_tags);
				var recipes_with_nested_set_event_schema    = utils.transform.addImpactTags(recipesInfo.recipes, impact_tags);

				// Extend the event creator schema, which by default is just some info about alerts like `link`, `timestamp`, and `text`
				// With this default event, which will have tags and things
				eventSchema.tag_ids.input_options = impact_tags;

				// Give the client access to these
				info.eventCreatorSchema = eventSchema;
				info.sousChefs  = sous_chefs_with_nested_set_event_schema;
				info.recipes  = recipes_with_nested_set_event_schema;
				info.eventsInfo = eventsInfo;
				// Timezone
				info.timezone = timezoneSettingInfo.value;
				info.manualEventsTotal = manualEventsInfo.total;

				info.comparisonMetrics = comparisonMetrics;

				res.render('approval-river', {info: info});
			});
});

router.get('/articles', function(req, res) {
	var info = {};
	info.apikey = req.session.apikey;
	info.title = 'Articles';
	info.page = sanitize(info.title);

	var default_sort = '-metrics.ga_pageviews';

	// Fetch data
	queue()
		.defer(sendToApi(req, res), '/api/_VERSION/tags/categories')
		.defer(sendToApi(req, res), '/api/_VERSION/tags/levels')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/tag-attribute-colors.json')
		.defer(sendToApi(req, res), '/api/_VERSION/tags?sort=-created') 
		.defer(sendToApi(req, res), '/api/_VERSION/content?sort='+default_sort+'&facets=subject_tags,impact_tags,categories,levels')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
		// .defer(sendToApi(req, res), '/api/_VERSION/articles/comparisons') 
		.defer(sendToApi(req, res), '/api/_VERSION/settings/timezone')
		.defer(readFileAsJson, 'lib/public/data/common-data-models/article-schema.json')
		.defer(sendToApi(req, res), '/api/_VERSION/metrics?sort=name')
			.await(function(err,    tagCategories, tagLevels, tagAttributeColors, tagsInfo, contentInfo, eventSchema, timezoneSettingInfo, articleSchema, metricsInfo){
				logNullResponse(err, [tagCategories, tagLevels, tagAttributeColors, tagsInfo, contentInfo, eventSchema, timezoneSettingInfo, articleSchema, metricsInfo]);

				// Save this for later look up by facebook twitter bullets. This might change
				info.attributeColorLookup = tagAttributeColors;
				
				// Break these up into two groups on an object
				var tags = utils.transform.segregateTagTypes(tagsInfo.tags);

				// Add colors to impact categories and levels
				tags.categories = utils.transform.addColors(tagCategories, tagAttributeColors)
				tags.levels = utils.transform.addColors(tagLevels, tagAttributeColors)

				// Add tag options from our set
				eventSchema.tag_ids.input_options = tags.impact;
				articleSchema.tag_ids.input_options = tags.subject;

				// article_summaries = utils.transform.addTopLevelQuantMetrics(article_summaries);
				var article_summaries_with_hydrated_tags = utils.transform.hydrateTagsInfo(contentInfo.content_items, tags, ['subject_tag_ids','impact_tag_ids']);
				// var article_summaries_with_hydrated_tags = utils.transform.hydrateTagsInfo(contentInfo.content_items, tags, ['subject', 'impact']);

				tags.facets = contentInfo.facets;

				// TODO, change this up once we do more with metrics
				metricsInfo.metrics.forEach(function(metric){
					metric.sort_name = '-metrics.'+metric.name;
				});

				// TODO, kick this out to `transform`
				// What sorters do we have available to us?
				var default_dimensions = ['created', 'title','updated'].map(function(name){
					var pretty_name = name.charAt(0).toUpperCase() + name.slice(1, name.length);
					return {name: name, sort_name: name, display_name: pretty_name};
				});
				var dimensions = default_dimensions.concat(metricsInfo.metrics); // These come from the docs

				// Main tag list
				info.tags = tags;
				// Creating events
				info.eventCreatorSchema = eventSchema;
				// Empty for now
				info.articleComparisons = {};
				// Our first page of content items
				info.articleSummariesInfo = {
					content_items: article_summaries_with_hydrated_tags,
					pagination: contentInfo.pagination,
					total: contentInfo.total,
					sort: default_sort // For now this is the same as the dimensions sort but it doesn't have to be
				}
				// Timezone
				info.timezone = timezoneSettingInfo.value;
				// Article schema for manually creating articles
				info.addArticleSchema = articleSchema;

				info.dimensionsInfo = {
					dimensions: dimensions,
					sort: default_sort // Same as above
				};

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
router.get('/auths/google-analytics/grant', grantAccess('google-analytics') );
router.get('/auths/twitter/grant', grantAccess('twitter') );
router.get('/auths/facebook/grant', grantAccess('facebook') );

// Revoke auths
router.get('/auths/google-analytics/revoke', revokeAccess('google-analytics') );
router.get('/auths/twitter/revoke', revokeAccess('twitter') );
router.get('/auths/facebook/revoke', revokeAccess('facebook') );


module.exports = router;
