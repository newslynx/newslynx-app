models.user_setting = {
	"Model": Backbone.Model.extend({
		url: function(){
			return this.collection.url;
		}
	})
}