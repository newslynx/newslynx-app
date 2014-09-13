collections.article_detailed_events = {
	"categories_instance": null,
	"levels_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata
	})
}