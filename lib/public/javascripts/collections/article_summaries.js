collections.article_summaries = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/content?facets=subject_tags,impact_tags,categories,levels',
		parse: function(response){
			this.metadata('pagination', response.pagination);
			this.metadata('total', response.total);
			// This will fire a change event and update counts as well as show hide containers
			models.tag_facets.set(response.facets);

			return response.content_items;
		},
	})
}