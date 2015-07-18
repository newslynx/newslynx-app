collections.article_detailed_timeseries = {
	"Collection": Backbone.Collection.extend({

		metadata: helpers.modelsAndCollections.metadata,

		setUrl: function(articleId){
      this.url = 'api/_VERSION/content/'+articleId+'/timeseries'
    },

    parse: function(response){
      var metric_selects = collections.dimensions.instance.metadata('timeseries-selects');

      var filtered_response = response.map(function(evt){
        return _.pick(evt, metric_selects);
      });

      return filtered_response;
    }

	})
}