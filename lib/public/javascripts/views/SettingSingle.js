views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals();

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	render: function(){
		var template = this.options.template || this.template;
		var parent_el = this.options.parentEl || this.parentEl;

		if (template){
			this.$el.html(template( {} ));
			if (parent_el){
				$(parent_el).append(this.el);
			}
		}

		return this;

	},

	postSaveHook: function(){
		var self = this

		var required_fields = ['homepage', 'timezone'];

		required_fields.forEach(function(requiredField){
			var saved_model_name = this.model.get('name'),
					saved_model_value = this.model.get('value');
			if (requiredField == saved_model_name){
				pageData.org[requiredField] = saved_model_value;
			}
		}, this);

		if (pageData.org.homepage && pageData.org.timezone){
			$('#promotion').attr('data-required-fields-set', 'true');
		}

		// If we have an associated recipe
		// Set its value
		var recipe_info = this.options.recipeInfo
		var recipe_name = recipe_info.recipe_name
		var recipe_model
		var attrs_to_save = {}
		if (recipe_name) {
			recipe_model = collections.recipes.instance.findWhere({name: recipe_name})
			if (!recipe_model) {
				console.log('Warning: Expected a recipe model `' + recipe_name + '` to exist while updating setting ', this.model.get('name'))
			} else {
				attrs_to_save[this.options.value_key] = this.model.get('value')
				recipe_model.save(attrs_to_save, {
					error: function(){
						console.log('Error updating associated recipe `' + recipe_name + ' from setting ', self.model.get('name'))
					},
					success: function(){
						console.log('Success updating associated recipe `' + recipe_name + ' from setting ', self.model.get('name'))
					}
				})
			}
		}

	}

});