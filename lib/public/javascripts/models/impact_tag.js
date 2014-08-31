models.impact_tag = {
	"Model": Backbone.Model.extend({
		defaults: {
			active: false,
			category: null,
			attribute: null
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}