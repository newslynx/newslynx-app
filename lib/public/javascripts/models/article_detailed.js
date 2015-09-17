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
    }

	})
}