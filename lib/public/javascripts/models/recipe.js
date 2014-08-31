models.recipe = {
	"Model": Backbone.Model.extend({
		defaults: {
			viewing: false
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}