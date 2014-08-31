models.alert = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/alerts',
		defaults: {
			destroy: false
		}
	})
}