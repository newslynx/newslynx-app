collections.detail_items = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		getTrue: helpers.modelsAndCollections.getTrue,
		zeroOut: helpers.modelsAndCollections.zeroOut,
		meta: helpers.modelsAndCollections.meta,
	})
}