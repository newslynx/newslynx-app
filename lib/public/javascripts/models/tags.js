models.tags = {
	"Model": Backbone.Model.extend({
		defaults: {
			active: false
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}