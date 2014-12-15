collections.loaded_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata
	})
}