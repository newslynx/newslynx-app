collections.user_values = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.user_value.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/me'
	})
}