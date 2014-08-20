var collections = collections || {};
collections.drawer_items = {
	"instance": null,
	"instance_static": null,
	"Collection": Backbone.Collection.extend({
		model: models.drawer_list_item.Model,
		getTrue: helpers.modelsAndCollections.getTrue,
		zeroOut: helpers.modelsAndCollections.zeroOut,
		setBoolByIds: helpers.modelsAndCollections.setBoolByIds,
	})
}