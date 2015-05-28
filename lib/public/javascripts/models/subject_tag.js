models.subject_tag = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		defaults: {
			type: 'subject'
		},
		urlRoot: function(){
			return '/api/_VERSION/tags'
		}
	})
}