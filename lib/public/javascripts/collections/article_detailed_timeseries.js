collections.article_detailed_timeseries = {
	"categories_instance": null,
	"levels_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'TK'
	})
}