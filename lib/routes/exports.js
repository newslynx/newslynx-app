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
  // Fetch data

  // TODO, handle multiple content item ids
  var content_item_id = req.query.content_item_ids
  var timestamp = req.query.timestamp

  queue()
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?per_page=100&sous_chefs=-twitter-search-content-items-to-event&content_item_ids='+content_item_id)
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/content/'+content_item_id+'/timeseries?sort=-datetime')
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?per_page=100&sous_chefs=twitter-search-content-items-to-event&content_item_ids='+content_item_id)
      .await(function(err,    eventsInfo, timeseriesData, tweetsInfo){
        logNullResponse(err, [eventsInfo, timeseriesData, tweetsInfo]);

        var status_code = (err) ? 500 : 200;

        var csvs = {};
        // Flatten these things
        csvs[timestamp+'_article_'+content_item_id+'_events'] = eventsInfo.events;
        csvs[timestamp+'_article_'+content_item_id+'_timeseries'] = timeseriesData;
        csvs[timestamp+'_article_'+content_item_id+'_tweets'] = tweetsInfo.events;
        res.json(status_code, csvs)

      })

})

module.exports = router