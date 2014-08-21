models.drawer_list_item = {
	"Model": Backbone.Model.extend({
		defaults: {
			viewing: false,
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}