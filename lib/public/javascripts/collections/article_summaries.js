collections.article_summaries = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		url: 'api/articles/summary',
		comparator: function(articleSummary){
			return -articleSummary.get('timestamp');
		}
	})
}