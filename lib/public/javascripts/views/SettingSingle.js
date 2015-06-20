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
	}

});