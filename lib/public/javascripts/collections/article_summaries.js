collections.article_summaries = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		url: 'api/articles/summary',
		comparator: function(articleSummary){
			// Reverse sort on a numerical field
			return -articleSummary.get('timestamp');
		}
	})
}