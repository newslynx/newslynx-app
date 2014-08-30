models.river_item = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/alerts',
		defaults: {
			destroy: false,
			mhk: true
		}
	})
}