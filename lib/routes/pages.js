/*
 * Routes for specific pages on the front-end
 * e.g. /settings, /approval-river, /articles
*/

var router = require('express').Router();
var fs = require('fs');
var queue = require('queue-async');
var app = require('../app');
var settings = require('../settings');
var utils = require('../utils');


var debug = require('tracer').colorConsole({
  format : ["\033[36m{{timestamp}} (in {{file}}:{{line}}) \033[m  \n{{message}}",{error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}"}],
  dateformat : "HH:MM:ss.L"
});
var chalk = require('chalk');
var path = require('path');

function readFileAsUtf8(filePath, cb){
  fs.readFile(filePath, 'utf-8', cb);
}

var base_path = path.resolve(__dirname, '../..')
function readFileAsJson(filePath, cb){
  fs.readFile(path.join(base_path,filePath), 'utf-8', function(err, result){
    cb(null, JSON.parse(result));
  });
}

function sanitize(title){
  return title.toLowerCase();
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
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Home';
  info.page = sanitize(info.title);
  res.render('index', {info: info});
});

router.get('/about', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'About';
  info.page = sanitize(info.title);
  res.render('about', {info: info});
});

router.get('/submit', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Submit';
  info.page = sanitize(info.title);

  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?type=impact')
    .defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/settings/timezone')
      .await(function(err,    impactTagsInfo, eventSchema, timezoneSettingInfo){
        logNullResponse(err, [impactTagsInfo, eventSchema, timezoneSettingInfo]);


        var impact_tags = impactTagsInfo.tags;
        eventSchema.tag_ids.input_options = impact_tags;

        var timezone = timezoneSettingInfo.value;

        info.eventCreatorSchema = eventSchema;
        info.timezone = timezone;
        info.tags = {
          impact: impact_tags
        };
        res.render('submit', {info: info});

      });

});

router.get('/settings', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
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
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/me')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/settings')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?sort=created')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/recipes?sort=created&sous_chefs=rss-feed-to-article,twitter-list-to-event,twitter-user-to-event,facebook-page-to-event')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/auths')
      .await(function(err,    userInformation, orgSettings, tagsInfo, recipesList, orgAuths){
        logNullResponse(err, [userInformation, orgSettings, tagsInfo, recipesList, orgAuths]);

        // This will be useful to have in dictionary format
        info.org = utils.transform.turnSettingsListToDict(orgSettings, {id: req.session.org_id});
        // On initial account creation, these orgSettings will be totally blank, i.e. an empty list
        // To get everything bound properly to the UI, scaffold the `homepage` and the `timezone` values
        info.orgSettingsList = utils.transform.scaffoldDefaultSettings(orgSettings, ['homepage', 'timezone', 'domains']);

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
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Approval River';
  info.page = sanitize(info.title);

  // Fetch data
  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?type=impact')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/sous-chefs?creates=events')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/recipes?creates=events&status=-inactive')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?status=pending&per_page=25&recipe_ids=2,3,4') // TODO, remove once better dummy data
    .defer(readFileAsJson,      'lib/public/data/common-data-models/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/settings/timezone')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?provenance=manual&per_page=1')
      .await(function(err,    impactTagsInfo, sousChefsInfo, recipesInfo, eventsInfo, eventSchema, timezoneSettingInfo, manualEventsInfo){
        logNullResponse(err, [impactTagsInfo, sousChefsInfo, recipesInfo, eventsInfo, eventSchema, timezoneSettingInfo, manualEventsInfo]);
        

        var impact_tags = impactTagsInfo.tags;

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

        res.render('approval-river', {info: info});
      });
});

router.get('/articles', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Articles';
  info.page = sanitize(info.title);

  var default_sort_bys = '-metrics.ga_pageviews';

  // Fetch data
  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags/categories')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags/levels')
    .defer(readFileAsJson, 'lib/public/data/common-data-models/tag-attribute-colors.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?sort=-created') 
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content?sort='+default_sort_bys+'&facets=subject_tags,impact_tags,categories,levels')
    .defer(readFileAsJson, 'lib/public/data/common-data-models/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/comparisons') 
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/settings/timezone')
    .defer(readFileAsJson, 'lib/public/data/common-data-models/article-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/metrics?sort=name')
      .await(function(err,    tagCategories, tagLevels, tagAttributeColors, tagsInfo, contentInfo, eventSchema, comparisonMetrics, timezoneSettingInfo, articleSchema, metricsInfo){
        logNullResponse(err, [tagCategories, tagLevels, tagAttributeColors, tagsInfo, contentInfo, eventSchema, comparisonMetrics, timezoneSettingInfo, articleSchema, metricsInfo]);

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

        // var article_summaries_with_hydrated_tags = utils.transform.hydrateTagsInfo(contentInfo.content_items, tags, ['subject_tag_ids','impact_tag_ids'], tagAttributeColors);

        tags.facets = contentInfo.facets;

        var metrics_with_sort_names = utils.transform.addApiSortNames(metricsInfo.metrics);

        // Add default sort options
        // We can sort by any metric, as well as a few fields such as `created`, `title` and `updated`. That info comes to us from the docs
        // So we add it by hand here
        // We'll call the combination of metrics and other fields, such as `title` and `created` "dimensions"
        var dimensions = utils.transform.assembleDimensionsFromMetricsAndArticleAttrs(metrics_with_sort_names, ['created', 'title', 'updated', 'subject_tags', 'impact_tags']);

        // We set the Api string up above, for now it's `-metrics.ga_pagviews` but we want to make this more readable
        // So that we can set our dimensions collection programatically
        // So extract the column name and set ascending to a boolean
        var dimension_default_sort_settings = utils.transform.reformatDefaultSort(default_sort_bys);


        // Main tag list
        info.tags = tags;
        // Creating events
        info.eventCreatorSchema = eventSchema;
        // Empty for now
        info.comparisonMetrics = comparisonMetrics;
        // Our first page of content items
        info.articleSummariesInfo = {
          response: contentInfo,
          sort_by: default_sort_bys // This is the string we set above, used for API calls
        }
        // Timezone
        info.timezone = timezoneSettingInfo.value;
        // Article schema for manually creating articles
        info.addArticleSchema = articleSchema;

        info.dimensionsInfo = {
          dimensions: dimensions,
          sort_by: dimension_default_sort_settings.sort_by, // These are used for sorting comparison grid
          sort_ascending: dimension_default_sort_settings.sort_ascending
        };

        res.render('articles', {info: info});
      });
});

router.get('/articles/lookup', function(req, res){
  var url = req.query.url;

  if (url){
    queue()
      .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/articles/lookup?url='+url)
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


module.exports = router;
