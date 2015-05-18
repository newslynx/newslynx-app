collections.user_settings = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.user_setting.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/me'
	})
}