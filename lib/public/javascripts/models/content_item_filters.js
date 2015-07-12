models.filters = {
	"Model": Backbone.Model.extend({
		metadata: helpers.modelsAndCollections.metadata,
		initialize: function(){
			this.on('filter', this.checkChanged);
			this.assembleQueryParams();

			return this;
		},
		checkChanged: function(){
			var previous = this.metadata('previousParams'),
					current = JSON.stringify(this.assembleQueryParams(true));

			console.log('previous', previous)
			console.log('current', current)

			if (previous != current){
				this.trigger('hasChanged');
			}

			return this;
		},
		assembleQueryParams: function(silent){
			var model_json = $.extend(true, {}, this.toJSON()); 
			_.each(model_json, function(val, key){
				if (_.isArray(val)){
					model_json[key] = val.join(',');
				}
			});
			if (model_json.sort_by){
				model_json.sort = model_json.sort_by;

				delete model_json.sort_by;
			}
			if (!silent){
				this.metadata('previousParams', JSON.stringify(model_json));
			}
			return model_json;
		}
	})
}