collections.recipes = {
	"instance": null,
	"schemas_instance": null,
	"Collection": Backbone.Collection.extend({
		url: '/api/recipes',
		model: models.recipe.Model,
		setBoolByIds: helpers.modelsAndCollections.setBoolByIds,
		comparator: function(recipe){
			return -recipe.id;
		}
	})
}