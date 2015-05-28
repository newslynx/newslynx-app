models.impact_tag = {
	"Model": Backbone.Model.extend({
		defaults: {
			type: 'impact',
			color: '#6699cc',
			active: false,
			category: null,
			level: null
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}