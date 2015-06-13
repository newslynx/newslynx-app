views.SettingTwitterUser = views.AA_BaseSettingListItemRecipe.extend({


	initialize: function(options){
		
		this.default_model_opts =  {
			sous_chef: 'twitter-user-to-event',
			name: 'twitter_user_to_promotion_recipe_name',
			options: {
				search_query: pageData.org.homepage,
				set_event_type: 'promotion'
			},
			validate: function(attrs){
				if (!attrs.options.search_query){
					return 'You must supply a homepage for this recipe to be valid';
				}
			}
		};

		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[screen_name]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});