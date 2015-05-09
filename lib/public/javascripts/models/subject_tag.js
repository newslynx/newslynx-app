models.subject_tag = {
	"Model": Backbone.Model.extend({
		defaults: {
			active: false
		},
		toggle: helpers.modelsAndCollections.toggle,
		urlRoot: function(){
			return '/api/tags/'
		}
	})
}