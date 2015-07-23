/*
 * Routes for exporting data
*/

var router = require('express').Router();
var settings = require('../settings');
var queue = require('queue-async');
var debug = require('tracer').console();

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
    .defer(utils.auth.sendToApi(req, res), '/api/_VERSION/events?content_item_ids='+content_item_id)
    .defer(utils.auth.sendToApi(req, res), 'api/_VERSION/content/'+content_item_id+'/timeseries?sort=-datetime')
      .await(function(err,    events, timeseries){
        logNullResponse(err, [events, timeseries]);

        var csvs = {}
        csvs[timestamp+'_article_'+content_item_id+'_events'] = {};
        csvs[timestamp+'_article_'+content_item_id+'_timeseries'] = {};
        res.json({})

      })

})

module.exports = router