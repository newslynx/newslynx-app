collections.article_summaries = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/content',
		parse: function(response){
			this.metadata('pagination', response.pagination);
			this.metadata('total', response.total);
			return response.content_items;
		},
	})
}