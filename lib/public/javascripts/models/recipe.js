models.recipe = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		defaults: {
			viewing: false, 
			enabled: true // TODO, we're not using this but could implement, it's used to turn the recipe on and off
		},
		initialize: function(itemObj){
			var keys  = _.chain(itemObj.options).keys().filter(function(key){
							var val = _.clone(itemObj.options[key])
							if (_.isObject(val) && val.input_options) {
								delete val.input_options;
							}
							return /^set_event_/.test(key) && !_.isEmpty(val);
						}).value();
			var set_val = keys.length ? true : false;
			this.set('set_default_event', set_val);

		}
	})
}