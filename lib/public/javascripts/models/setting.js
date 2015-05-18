models.setting = {
	"Model": Backbone.Model.extend({
		url: function(){
			return '/api/:version/settings'
		}
	})
}