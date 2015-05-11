models.me = {
	"Model": Backbone.Model.extend({
		url: function(){
			return '/api/:version/me'
		}
	})
}