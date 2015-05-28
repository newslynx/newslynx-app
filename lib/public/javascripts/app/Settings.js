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

		// Bind subject tags to inputs
		collections.subject_tags.instance.each(function(subjectTag){

			var $subject_tag_container = this.$content.find('.js-inputs-container[data-setting-name="subject-tags"]');
			var subject_tag_view = new views.SettingSubjectTag({model: subjectTag});
			$subject_tag_container.append(subject_tag_view.el);
			this._subviews.push(subject_tag_view);

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

	addItem: function(e){
		var $btn = $(e.currentTarget),
				is_first = $btn.attr('data-first');

		// Make the `create` button turn into a `'+'` button
		if (is_first === 'true'){
			$btn.attr('data-first', 'false');
		}

		// A crossover between our data attribte names and our view names
		var views_crossover = {
			'subject-tags': {
				view_name: 'SettingSubjectTag'
			},
			'impact-tags': {
				view_name: 'SettingImpactTag'
			}
		};

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				setting_name = $inputsContainer.attr('data-setting-name'),
				setting_view_info = views_crossover[setting_name];

		var view = new views[setting_view_info.view_name]({ });

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