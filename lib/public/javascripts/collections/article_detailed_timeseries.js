collections.article_detailed_timeseries = {
	"Collection": Backbone.Collection.extend({

		metadata: helpers.modelsAndCollections.metadata,

		setUrl: function(articleId){
      this.url = 'api/_VERSION/content/'+articleId+'/timeseries?sort=-datetime'
    },

    parse: function(response){
      var metric_selects = ['datetime'].concat(collections.dimensions.instance.metadata('select-timeseries'));

      var filtered_response = response.map(function(evt){
        return _.pick(evt, metric_selects);
      });

      return filtered_response;
    }

	})
}