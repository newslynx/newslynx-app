var collections = collections || {};
collections.row_items = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.detail_item.Model,
		getTrue: helpers.modelsAndCollections.getTrue,
		zeroOut: helpers.modelsAndCollections.zeroOut
	})
}