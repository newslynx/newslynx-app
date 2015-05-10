models.setting = {
	"Model": Backbone.Model.extend({
		url: function(){
			return '/api/:version/orgs/'+pageData.org.id+'/settings'
		}
	})
}