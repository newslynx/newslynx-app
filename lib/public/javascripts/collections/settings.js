collections.settings = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.setting.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/orgs/settings'
	})
}