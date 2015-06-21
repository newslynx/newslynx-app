// Just a plain old model
models.content_item_filters = {
	"Model": Backbone.Model.extend({
		defaults: {
			sort: 'metrics.ga_pageviews' // Can change if you want
		},
		assembleQueryParams: function(){
			var model_json = this.toJSON();
			_.each(model_json, function(val, key){
				if (_.isArray(val)){
					model_json[key] = val.join(',');
				}
			});
			return model_json;
		}
	})
}