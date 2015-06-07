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

		this.default_recipes = {
			'rss-feeds': {
				view_name: 'SettingRssFeed',
				recipe_name: app.defaults.rss_feed_recipe_name,
				options: {
					template: templates.rssFeedRecipeFactory
				}
			},
			'staff-twitter-lists': {
				view_name: 'SettingStaffTwitterList',
				recipe_name: app.defaults.staff_twitter_list_to_promotion_recipe_name,
				options: {
					template: templates.staffTwitterListRecipeFactory
				}
			},
			'twitter-users': {
				view_name: 'SettingTwitterUser',
				recipe_name: app.defaults.twitter_user_to_promotion_recipe_name,
				options: {
					template: templates.twitterUserRecipeFactory
				}
			},
			'facebook-pages': {
				view_name: 'SettingFacebookPage',
				recipe_name: app.defaults.facebook_page_to_promotion_recipe_name,
				options: {
					template: templates.facebookPageRecipeFactory
				}
			},
			'subject-tags': {
				view_name: 'SettingSubjectTag'
			},
			'impact-tags': {
				view_name: 'SettingImpactTag'
			}
		};

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

		// Bind article recipes to inputs
		_.each(this.default_recipes, function(recipeInfo, recipeShorthand){
			var recipe_name = recipeInfo.recipe_name,
					recipe_models = collections.recipes.instance.where({name: recipeInfo.recipe_name});

			var $parent_el = this.$content.find('.js-inputs-container[data-setting-name="'+recipeShorthand+'"]');
			
			if (recipe_models.length){
				this.setGroupEmpty($parent_el.parents('.js-setting-group'), 'false');
			}

			recipe_models.forEach(function(recipeModel){
				var view_options = _.extend({
					model: recipeModel,
					parentEl: $parent_el[0]
				}, recipeInfo.options);

				console.log(recipeModel.get('created'))
				console.log(recipeModel.get('options').screen_name)

				var setting_view = new views[recipeInfo.view_name]( view_options );
				$parent_el.append(setting_view.el);
				this._subviews.push(setting_view);
			}, this);

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

	// writeFormData: function($parentForm, data){
	// 	var string_data = JSON.stringify( _.extend(this.getCurrentFormDataFull($parentForm), data) );
	// 	$parentForm.attr('data-saved-settings', string_data);
	// },


	// getCurrentFormDataFull: function($parentForm){
	// 	return _.extend(this.getSavedFormData($parentForm), $parentForm.serializeJSON());
	// },

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

		// TODO, maybe refactor this into a method on a view that instantiates the add button

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				setting_name = $inputsContainer.attr('data-setting-name'),
				setting_view_info = this.default_recipes[setting_name],
				options = setting_view_info.options || {}

				console.log(setting_view_info.view_name)
				console.log(options)

		var view = new views[setting_view_info.view_name]( options );

		$inputsContainer.append(view.el);
		this._subviews.push(view);

		return this;

	},

	reportError: function(msg){
		console.log('Error', msg);
		return false;
	},

	// validateSettings: function(settings){
	// 	// Check if passwords match
	// 	if ( settings.password) {
	// 		if (!_.isEqual(settings.password[0],settings.password[1]) ) { this.reportError('Passwords do not match'); return false }
	// 		else {settings.password = settings.password[0]}
	// 	} 
	// 	// // Return true if none of our conditions were false
	// 	return true;
	// }

});