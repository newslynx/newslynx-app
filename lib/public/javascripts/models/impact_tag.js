models.impact_tag = {
	"Model": Backbone.Model.extend({
		defaults: {
			type: 'impact',
			active: false,
			category: null,
			level: null
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}