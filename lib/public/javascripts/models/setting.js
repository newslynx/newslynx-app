models.setting = {
	"Model": Backbone.Model.extend({
		url: function(){
			return '/api/orgs/'+pageData.org.id+'/settings'
		}
	})
}