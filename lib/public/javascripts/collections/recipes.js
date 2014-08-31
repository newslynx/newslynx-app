collections.recipes = {
	"instance": null,
	"instance_static": null,
	"Collection": Backbone.Collection.extend({
		model: models.recipe.Model,
		getTrue: helpers.modelsAndCollections.getTrue,
		setBoolByIds: helpers.modelsAndCollections.setBoolByIds,
	})
}