/*
 * Routes for specific pages on the front-end
 * e.g. /settings, /approval-river, /articles
*/

var router = require('express').Router();
var fs = require('fs-plus');
var queue = require('queue-async');
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
  return title.toLowerCase().replace(/ /g, '-');
}

function logNullResponse(err, results){
  if (err) {
    debug.log(err);
  }  else {
    console.log('')
    console.log(chalk.magenta(results.length + ' resources fetched.'))
  }

  results.forEach(function(result){
    var name = result.name,
        response = result.response;

    if (!response || response.status_code >= 400) {
      console.log(chalk.red('ERROR, '+response.status_code+' status code at route:'), name, chalk.red('\nWith object'), response);
    } 
  });

}

function checkTimezone(timezoneInfo){
  return timezoneInfo.status_code !== 404;
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
    .defer(readFileAsJson, 'lib/public/data/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/orgs/settings/timezone')
      .await(function(err,    impactTagsInfo, eventSchema, timezoneSettingInfo){
        logNullResponse(err, [
          {name: '/api/_VERSION/tags?type=impact', response: impactTagsInfo}, 
          {name: 'lib/public/data/event-schema.json', response: eventSchema}, 
          {name: '/api/_VERSION/orgs/settings/timezone', response: timezoneSettingInfo}
        ]);

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
    homepage_recipe_name: 'Time on Homepage',
    rss_feed_recipe_name: 'Ingest Articles from an RSS Feed',
    staff_twitter_list_to_promotion_recipe_name: 'Staff Twitter List to Promotion Event',
    staff_twitter_user_to_promotion_recipe_name: 'Staff Twitter User to Promotion Event',
    staff_facebook_page_to_promotion_recipe_name: 'Staff Facebook Page to Promotion Event'
  };

  var recipe_q = queue()
  var page_q = queue()

  var auth_success = req.query.auth_success,
      auth_service = req.query.service;

  var auth_success_recipes = {
    'google-analytics': [
      'default-google-analytics-to-content-timeseries',
      'default-google-analytics-to-content-device-summaries',
      'default-google-analytics-to-content-domain-facets'
    ],
    twitter: [
      'default-share-counts-to-content-timeseries'
    ]
  }
  // Fetch data
  page_q
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/me')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/orgs/settings')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?sort=created')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/recipes?sort=created&sous_chefs=rss-feed-to-article,twitter-list-to-event,twitter-user-to-event,facebook-page-to-event')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/auths')

  var recipe_urls,
      put_req;

  // Only make recipe requests if our query param match these services
  var services = Object.keys(auth_success_recipes);
  if (services.indexOf(auth_service) != -1 && auth_success === 'true') {
    recipe_urls = auth_success_recipes[auth_service].map(function(slug){
      return '/api/_VERSION/recipes/' + slug;
    });
    // This will inherit a `GET` method from the main route we're in.
    // Instead, make this a `PUT` request to update our recipe data
    put_req = utils.transform.extend({}, req, {method: 'PUT'} )
    
    recipe_urls.forEach(function(slugToUpdate){
      recipe_q.defer(utils.auth.sendToApi(put_req,res), slugToUpdate)
    });

    recipe_q.awaitAll(function(err, recipes){
      if (err) {
        debug.log(err);
        info[auth_service+'_recipes'] = {status: 500, error: err}
      } else {
        info[auth_service+'_recipes'] = {status: 200, recipes: recipes}
      }
      renderPage()
    })

  } else {
    renderPage()
  }

  function renderPage() {
    page_q.await(function(err, userInformation, orgSettings, tagsInfo, recipesList, orgAuths){
      logNullResponse(err, [
        {name: '/api/_VERSION/me', response: userInformation}, 
        {name: '/api/_VERSION/orgs/settings', response: orgSettings}, 
        {name: '/api/_VERSION/tags?sort=created', response: tagsInfo}, 
        {name: '/api/_VERSION/recipes?sort=created&sous_chefs=rss-feed-to-article,twitter-list-to-event,twitter-user-to-event,facebook-page-to-event', response: recipesList}, 
        {name: '/api/_VERSION/auths', response: orgAuths}
      ]);

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
    })
  }

});

router.get('/approval-river', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Approval River';
  info.page = sanitize(info.title);

  // Fetch data
  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?type=impact')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/sous-chefs?creates=events&sous_chefs=-twitter-search-content-item-links-to-event&sort=slug')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/recipes?creates=events&status=-inactive&recipes=-twitter-list-to-event-promotion,-twitter-user-to-event-promotion,-facebook-page-to-event-promotion&sous_chefs=-twitter-search-content-item-links-to-event')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?status=pending&per_page=25')
    .defer(readFileAsJson,      'lib/public/data/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/orgs/settings/timezone')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?provenance=manual&status=pending&per_page=1')
      .await(function(err,    impactTagsInfo, sousChefsInfo, recipesInfo, eventsInfo, eventSchema, timezoneSettingInfo, manualEventsInfo){
        logNullResponse(err, [
          {name: '/api/_VERSION/tags?type=impact', response: impactTagsInfo}, 
          {name: '/api/_VERSION/sous-chefs?creates=events&sous_chefs=-twitter-search-content-item-links-to-event&sort=slug', response: sousChefsInfo}, 
          {name: '/api/_VERSION/recipes?creates=events&status=-inactive&recipes=-twitter-list-to-event-promotion,-twitter-user-to-event-promotion,-facebook-page-to-event-promotion&sous_chefs=-twitter-search-content-item-links-to-event', response: recipesInfo}, 
          {name: '/api/_VERSION/events?status=pending&per_page=25', response: eventsInfo}, 
          {name: 'lib/public/data/event-schema.json', response: eventSchema}, 
          {name: '/api/_VERSION/orgs/settings/timezone', response: timezoneSettingInfo}, 
          {name: '/api/_VERSION/events?provenance=manual&status=pending&per_page=1', response: manualEventsInfo}
        ]);
        
        var has_timezone = checkTimezone(timezoneSettingInfo);

        if (has_timezone) {
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
        } else {
          res.redirect('/settings');
        }
      });
});

router.get('/articles', function(req, res) {
  var info = {};
  info.authed = (req.session.apikey) ? true : false;
  info.title = 'Articles';
  info.page = sanitize(info.title);

  var default_sort_bys = '-created';
  // var default_sort_bys = '-metrics.ga_pageviews';

  // Fetch data
  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags/categories')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags/levels')
    .defer(readFileAsJson, 'lib/public/data/tag-attribute-colors.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/tags?sort=-created') 
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content?sort=' + default_sort_bys + '&facets=subject_tags,impact_tags,categories,levels')
    .defer(readFileAsJson, 'lib/public/data/event-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/comparisons') 
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/orgs/settings/timezone')
    .defer(readFileAsJson, 'lib/public/data/article-schema.json')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/metrics?sort=name')
      .await(function(err,    tagCategories, tagLevels, tagAttributeColors, tagsInfo, contentInfo, eventSchema, comparisonMetrics, timezoneSettingInfo, articleSchema, metricsInfo){
        logNullResponse(err, [{
          name: '/api/_VERSION/tags/categories', response: tagCategories},
          {name: '/api/_VERSION/tags/levels', response: tagLevels},
          {name: 'lib/public/data/tag-attribute-colors.json', response: tagAttributeColors},
          {name: '/api/_VERSION/tags?sort=-created', response: tagsInfo},
          {name: '/api/_VERSION/content?sort=' + default_sort_bys + '&facets=subject_tags,impact_tags,categories,levels', response: contentInfo},
          {name: 'lib/public/data/event-schema.json', response: eventSchema},
          {name: '/api/_VERSION/content/comparisons', response: comparisonMetrics},
          {name: '/api/_VERSION/orgs/settings/timezone', response: timezoneSettingInfo},
          {name: 'lib/public/data/article-schema.json', response: articleSchema},
          {name: '/api/_VERSION/metrics?sort=name', response: metricsInfo}
        ]);

        var has_timezone = checkTimezone(timezoneSettingInfo);

        if (has_timezone) {
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
        } else {
          res.redirect('/settings');
        }
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
