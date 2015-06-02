app.Settings = Backbone.View.extend({
	el: '#main-wrapper',

	events: {
		'click button.add': 'addItem'
	},

	initialize: function(){

		this._subviews = [];

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');

		// Instantiate settings view
		this.render();
	},

	render: function(){

		// Bind user settings to inputs
		collections.user_settings.instance.each(function(userSetting){
			// These objects look like `{id: 1, email: 'merlynne.jones@newslynx.org'}`
			// so grab the key string that's not `id`.
			var name = _.findKey(userSetting.attributes, function(value, key){
				return key != 'id';
			});

			var setting_el = this.$content.find('.js-inputs-container[data-setting-name="'+name+'"]')[0];
			var setting_view = new views.SettingSingle({model: userSetting, el: setting_el, valueKey: name});
			this._subviews.push(setting_view);

		}, this);

		// Bind settings to inputs
		collections.settings.instance.each(function(orgSetting){
			var name = orgSetting.get('name');

			var setting_el = this.$content.find('.js-inputs-container[data-setting-name="'+name+'"]')[0];
			var setting_view = new views.SettingSingle({model: orgSetting, el: setting_el, valueKey: 'value'});
			this._subviews.push(setting_view);

		}, this);

		// Bind article rss recipes to inputs
		collections.recipes.instance.each(function(recipe){
			var sous_chef = recipe.get('sous_chef');

			var $parent_el = this.$content.find('.js-inputs-container[data-setting-name="'+sous_chef+'"]');
			var setting_view = new views.SettingRssFeed({model: recipe, template: templates.rssFeedRecipeFactory, parentEl: $parent_el[0]});
			$parent_el.append(setting_view.el);
			this._subviews.push(setting_view);

		}, this);

		// If we have any staff twitter lists, add them
		var staff_twitter_list_promotion_recipes = collections.recipes.instance.where({name: app.defaults.staff_twitter_list_to_promotion_recipe_name});
		var $staffTwitterListsInputsContainer = this.$content.find('.js-inputs-container[data-setting-name="staff-twitter-lists"]');

		if (staff_twitter_list_promotion_recipes.length){
			this.setGroupEmpty($staffTwitterListsInputsContainer.parents('.js-setting-group'), 'false');
		}

		staff_twitter_list_promotion_recipes.forEach(function(twitterListPromotionRecipe){

			var $parent_el = $staffTwitterListsInputsContainer;
			var setting_view = new views.SettingStaffTwitterList({model: twitterListPromotionRecipe, template: templates.staffTwitterListRecipeFactory, parentEl: $parent_el[0]});
			$parent_el.append(setting_view.el);
			this._subviews.push(setting_view);

		}, this);

		// If we have any twitter user lists, add them
		var twitter_user_promotion_recipes = collections.recipes.instance.where({name: app.defaults.twitter_user_to_promotion_recipe_name});
		var $twitterUsersInputsContainer = this.$content.find('.js-inputs-container[data-setting-name="twitter-users"]');

		console.log(twitter_user_promotion_recipes)
		if (twitter_user_promotion_recipes.length){
			this.setGroupEmpty($twitterUsersInputsContainer.parents('.js-setting-group'), 'false');
		}

		twitter_user_promotion_recipes.forEach(function(twitterUserPromotionRecipe){

			var $parent_el = $twitterUsersInputsContainer;
			var setting_view = new views.SettingTwitterUser({model: twitterUserPromotionRecipe, template: templates.twitterUserRecipeFactory, parentEl: $parent_el[0]});
			$parent_el.append(setting_view.el);
			this._subviews.push(setting_view);

		}, this);

		// Bind subject tags to inputs
		collections.subject_tags.instance.each(function(subjectTag){

			var $subject_tag_container = this.$content.find('.js-inputs-container[data-setting-name="subject-tags"]');
			var subject_tag_view = new views.SettingSubjectTag({model: subjectTag});
			$subject_tag_container.append(subject_tag_view.el);
			this._subviews.push(subject_tag_view);

		}, this);

		// Bind impact tags to inputs
		collections.impact_tags.instance.each(function(impactTag){

			var $impact_tag_container = this.$content.find('.js-inputs-container[data-setting-name="impact-tags"]');
			var impact_tag_view = new views.SettingImpactTag({model: impactTag});
			$impact_tag_container.append(impact_tag_view.el);
			this._subviews.push(impact_tag_view);

		}, this);


		return this;
	},

	writeFormData: function($parentForm, data){
		var string_data = JSON.stringify( _.extend(this.getCurrentFormDataFull($parentForm), data) );
		$parentForm.attr('data-saved-settings', string_data);
	},


	getCurrentFormDataFull: function($parentForm){
		return _.extend(this.getSavedFormData($parentForm), $parentForm.serializeJSON());
	},

	setGroupEmpty: function($settingGroup, isEmpty){
		$settingGroup.attr('data-empty', isEmpty);

		return this;
	},

	addItem: function(e){
		var $btn = $(e.currentTarget),
				$settingGroup = $btn.parents('.js-setting-group'),
				is_empty = $settingGroup.attr('data-empty');

		// Make the `create` button turn into a `'+'` button
		if (is_empty === 'true'){
			this.setGroupEmpty($settingGroup, 'false')
		}

		// A crossover between our data attribute names and our view names
		// TODO, maybe refactor this into a method on a view that instantiates the add button
		var views_crossover = {
			'subject-tags': {
				view_name: 'SettingSubjectTag'
			},
			'impact-tags': {
				view_name: 'SettingImpactTag'
			},
			'rss-feed-to-contentium':{
				view_name: 'SettingRssFeed',
				options: {
					template: templates.rssFeedRecipeFactory
				}
			},
			'staff-twitter-lists':{
				view_name: 'SettingStaffTwitterList',
				options: {
					template: templates.staffTwitterListRecipeFactory
				}
			},
			'twitter-users':{
				view_name: 'SettingTwitterUser',
				options: {
					template: templates.twitterUserRecipeFactory
				}
			}
		};

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				setting_name = $inputsContainer.attr('data-setting-name'),
				setting_view_info = views_crossover[setting_name],
				options = setting_view_info.options || {}

		var view = new views[setting_view_info.view_name]( options );

		$inputsContainer.append(view.el);
		this._subviews.push(view);

		return this;

	},

	reportError: function(msg){
		console.log('Error', msg);
		return false;
	},

	validateSettings: function(settings){
		// Check if passwords match
		if ( settings.password) {
			if (!_.isEqual(settings.password[0],settings.password[1]) ) { this.reportError('Passwords do not match'); return false }
			else {settings.password = settings.password[0]}
		} 
		// // Return true if none of our conditions were false
		return true;
	}

});