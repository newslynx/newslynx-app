models.recipe = {
	"Model": Backbone.Model.extend({
		defaults: {
			viewing: false,
			enabled: true
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}