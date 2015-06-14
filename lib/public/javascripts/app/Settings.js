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
				recipe_name: app.defaults.staff_twitter_user_to_promotion_recipe_name,
				options: {
					template: templates.twitterUserRecipeFactory
				}
			},
			'facebook-pages': {
				view_name: 'SettingFacebookPage',
				recipe_name: app.defaults.staff_facebook_page_to_promotion_recipe_name,
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

			var user_setting_views = {
				email: {
					view: views.SettingSingle
				},
				password: {
					view: views.SettingPassword
				}
			};

			var user_settings = ['email', 'password'];

			user_settings.forEach(function(userSettingName){
				// Create a model outside of this collection so different settings keys can act independently, be validated independently but still relate to the same object
				// You might wonder, why put these in a collection to begin with
				// This could be refactored to make this just a list of different models to begin with but at least the overall pattern with this is more like other elements except for this line here
				var oSetting = new models.user_setting.Model(userSetting.toJSON())
				var setting_el = this.$content.find('.js-inputs-container[data-setting-name="'+userSettingName+'"]')[0];
				var setting_view = new user_setting_views[userSettingName].view({model: oSetting, el: setting_el, valueKey: userSettingName});
				this._subviews.push(setting_view);

			}, this);


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

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				setting_name = $inputsContainer.attr('data-setting-name'),
				setting_view_info = this.default_recipes[setting_name],
				options = setting_view_info.options || {}

		var view = new views[setting_view_info.view_name]( options );

		$inputsContainer.append(view.el);
		this._subviews.push(view);

		return this;

	},

	reportError: function(msg){
		console.log('Error', msg);
		return false;
	}


});