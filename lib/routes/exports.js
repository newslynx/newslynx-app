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

  var content_item_ids_str = req.query.content_item_ids
  var content_item_ids_list = content_item_ids_str.split(',')
  var timestamp = req.query.timestamp
  var now = req.query.now

  var delimiters = {
    primary: '|',
    secondary: ','
  }

  // Set up our queues
  var qTimeseries = queue()
  var qTweets = queue()
  var qEvents = queue()

  var qMeta = queue()
    
  // Add items to our queues
  content_item_ids_list.forEach(function(contentItemId){
    qTimeseries.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/' + contentItemId + '/timeseries?sort=-datetime')
  })
  qTweets.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?sous_chefs=twitter-search-content-item-links-to-event&per_page=100&content_item_ids=' + content_item_ids_str)
  qEvents.defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?per_page=100&status=approved&sous_chefs=-twitter-search-content-item-links-to-event&content_item_ids=' + content_item_ids_str)


  // Add queues to queues
  qMeta.defer(qTimeseries.awaitAll);
  qMeta.defer(qTweets.awaitAll);
  qMeta.defer(qEvents.awaitAll);

  // Await for our queues of queues
  qMeta.await(function(err, timeseriesLists, tweetInfo, eventInfo){
    if (err) {
      debug.log(err)
    }
    var status_code = (err) ? 500 : 200;

    var events_by_id = utils.transform.exportHelpers.segregateById(eventInfo[0].events, content_item_ids_list);
    var tweets_by_id = utils.transform.exportHelpers.segregateById(tweetInfo[0].events, content_item_ids_list);

    // Add each list element to csv by id
    content_item_ids_list.forEach(function(id, index){
      csvs[timestamp+'_article_'+id+'_timeseries'] = timeseriesLists[index].map(utils.transform.exportHelpers.addExportedDate(now));
      csvs[timestamp+'_article_'+id+'_tweets'] = utils.transform.exportHelpers.events.call(delimiters, tweets_by_id[index], id).map(utils.transform.exportHelpers.addExportedDate(now));
      csvs[timestamp+'_article_'+id+'_events'] = utils.transform.exportHelpers.events.call(delimiters, events_by_id[index], id).map(utils.transform.exportHelpers.addExportedDate(now));
    })
    
    res.json(200, csvs)

  })

})

module.exports = router