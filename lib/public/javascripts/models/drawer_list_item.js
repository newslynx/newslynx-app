models.drawer_list_item = {
	"Model": Backbone.Model.extend({
		idAttribute: "uid",
		defaults: {
			viewing: false,
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}