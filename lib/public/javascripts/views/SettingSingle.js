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

	}

});

views.SettingListItemRecipe = views.SettingSingle.extend({

	tagName: 'li',

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.recipe.Model(this.default_model_opts);
			this.model.set('name', app.defaults[this.model.get('name')]); // The name is a string of the location on the `apps.default` object because if we store the `default_opts`, then those are undefined at runtime
			collections.recipes.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	}

});

// TODO, fix this in build process
views.SettingRssFeed = views.SettingListItemRecipe.extend({

	default_model_opts: {
		sous_chef: 'rss-feed-to-contentium',
		name: 'Ingest Articles from an RSS Feed.'
	},

	initialize: function(options){

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
		this.setVals(['options[feed_url]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});


// TODO, fix this in build process
views.SettingStaffTwitterList = views.SettingListItemRecipe.extend({

	default_model_opts: {
		sous_chef: 'event-twitter-list',
		name: 'staff_twitter_list_to_promotion_recipe_name',
		options: {
			search_query: pageData.org.homepage,
			set_event_type: 'promotion'
		},
		// validate: function(attrs){
		// 	console.log('here')
		// 	if (!attrs.options.search_query){
		// 		return 'You must supply a homepage for this recipe to be valid';
		// 	}
		// }
	},

	initialize: function(options){

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
		this.setVals(['options[list_owner_screen_name]', 'options[list_slug]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}


});

// TODO, fix this in build process
views.SettingTwitterUser = views.SettingListItemRecipe.extend({

	default_model_opts: {
		sous_chef: 'event-twitter-user',
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
	},

	initialize: function(options){

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