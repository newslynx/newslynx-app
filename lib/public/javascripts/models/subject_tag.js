models.subject_tag = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		urlRoot: function(){
			return '/api/_VERSION/tags'
		}
	})
}