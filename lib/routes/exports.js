/*
 * Routes for exporting data
*/

var router = require('express').Router();
var settings = require('../settings');
var queue = require('queue-async');
var debug = require('tracer').console();
var utils = require('../utils');
var chalk = require('chalk');

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

router.get('/exports', function(req, res) {
  var csvs = {};

  var export_helpers = utils.transform.exportHelpers

  var content_item_ids_str = req.query.content_item_ids
  var content_item_ids_list = content_item_ids_str.split(',')
  var timestamp = req.query.timestamp
  var now = req.query.now
  var tags = req.query.tags
  var separate = req.query.separate // If we're exporting multiple articles' data, we can put them all in one csv by type, or separate

  var delimiters = {
    primary: '|',
    secondary: ','
  }

  // Set up our queues
  var qArticleInfo = queue()
  var qTimeseries = queue()
  var qTweets = queue()
  var qEvents = queue()

  var qMeta = queue()
    
  // Add items to our queues
  content_item_ids_list.forEach(function(contentItemId){
    qArticleInfo.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/' + contentItemId)
    qTimeseries.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/' + contentItemId + '/timeseries?sort=-datetime')
    qTweets.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?sous_chefs=twitter-search-content-item-links-to-event&per_page=100&content_item_ids=' + contentItemId)
    qEvents.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?per_page=100&status=approved&content_item_ids=' + contentItemId)
  })

  // Add queues to queues
  qMeta.defer(export_helpers.articles,   qArticleInfo.awaitAll, now, tags)
  qMeta.defer(export_helpers.timeseries, qTimeseries.awaitAll,  now, content_item_ids_list)
  qMeta.defer(export_helpers.events,     qTweets.awaitAll,      now, delimiters, content_item_ids_list)
  qMeta.defer(export_helpers.events,     qEvents.awaitAll,      now, delimiters, content_item_ids_list)

  // Await for our queues of queues
  qMeta.await(function(err, articleLists, timeseriesLists, tweetsLists, eventsLists){
    if (err) {
      debug.log('ERROR in queue of queues', err)
    }
    var status_code = (err) ? 500 : 200;

    var ids_dashed = content_item_ids_list.join('-')

    /*
     * For adding them all in one csv with an article id column, if that exists
    */
    if (!separate) {
      csvs[timestamp+'_article_' + ids_dashed] = articleLists;
      csvs[timestamp+'_article_timeseries_' + ids_dashed] =  utils.transform.flatten(timeseriesLists)
      csvs[timestamp+'_article_tweets_' + ids_dashed] =  utils.transform.flatten(tweetsLists)
      csvs[timestamp+'_article_events_' + ids_dashed] =  utils.transform.flatten(eventsLists)
    } else {
      content_item_ids_list.forEach(function(id, index){
        csvs[timestamp+'_article_' + id] = [articleLists[index]];
        csvs[timestamp+'_article_timeseries_' + id] = timeseriesLists[index]
        csvs[timestamp+'_article_tweets_' + id] = tweetsLists[index]
        csvs[timestamp+'_article_events_' + id] = eventsLists[index]
      })
    }

    res.json(200, csvs)

  })

})

module.exports = router