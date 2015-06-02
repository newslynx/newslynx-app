views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();


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

	setVal: function(){
		var val = this.getVal();
		var $input = this.$form.find('.js-input-item');
		var existing_value = $input.val() || '';

		if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
			$input.val(val);
		}

		return this;
	}


});

// TODO, fix this in build process
views.SettingListItem = views.SettingSingle.extend({

	tagName: 'li'

});


// TODO, fix this in build process
views.SettingRssFeed = views.SettingListItem.extend({

	valueKey: 'options[feed_url]',

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
		this.setVal();

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.recipe.Model({
				sous_chef: 'rss-feed-to-contentium',
				name: 'Ingest Articles from an RSS Feed.'
			});
			collections.recipes.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	}

});

// TODO, fix this in build process
views.SettingStaffTwitterList = views.SettingListItem.extend({

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
		this.setVal();

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.recipe.Model({
				sous_chef: 'event-twitter-list',
				name: app.defaults.staff_twitter_list_to_promotion_recipe_name,
				options: {
					search_query: pageData.org.homepage || 'NEEDS-HOMEPAGE',
					set_event_type: 'promotion'
				}
			});
			collections.recipes.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	},

	setVal: function(){

		var inputs_data = this.assembleInputsData(['options[list_owner_screen_name]', 'options[list_slug]']);

		console.log(inputs_data)

		inputs_data.forEach(function(inputData){
			var $input = inputData.$input;
			var val = inputData.val;

			var existing_value = $input.val() || '';

			if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
				$input.val(val);
			}

		}, this);


		return this;
	}

});