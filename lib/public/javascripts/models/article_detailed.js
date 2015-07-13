models.article_detailed = {
	"Model": models.aa_base_article.Model.extend({

		getGaMetrics: function(){
      var ga_metrics = {};
      
      _.each(this.get('metrics'), function(val, key){
        if (/^ga_/.test(key)) {
          ga_metrics[key] = val;
        }
      });
      return ga_metrics;
    },
		
		getTimeSeriesStats: function(){
			var timeseries_stats = this.get('timeseries_stats'),
					timeseries_metrics = ['pageviews','twitter_count','facebook_share_count'],
					timeseries_filtered;
			// Construct a new object that inclues just the metrics we're interested in and a timestamp
			// These keys won't appear under each object, however
			timeseries_filtered = timeseries_stats.map(function(timeseries_stat){
				var keys = _.keys(timeseries_stat),
						filtered_obj = {};

				timeseries_metrics.forEach(function(timeseries_metric){
					var stat_has_metric = _.contains(keys, timeseries_metric);
					if (stat_has_metric){
						filtered_obj['timestamp'] = timeseries_stat.timestamp;
						filtered_obj[timeseries_metric] = timeseries_stat[timeseries_metric];
					}
				});

				return filtered_obj;
			});
			return timeseries_filtered;
		}

	})
}