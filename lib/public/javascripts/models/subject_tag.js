models.subject_tag = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		defaults: {
			type: 'subject',
			color: '#1f78b4'
		},
		urlRoot: function(){
			return '/api/_VERSION/tags'
		}
	})
}