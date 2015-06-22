models.content_item_filters = {
	"Model": Backbone.Model.extend({
		assembleQueryParams: function(){
			var model_json = $.extend(true, {}, this.toJSON()); // Not sure if this is required, but since we're modifying an object, it can't hurt
			_.each(model_json, function(val, key){
				if (_.isArray(val)){
					model_json[key] = val.join(',');
				}
			});
			return model_json;
		}
	})
}