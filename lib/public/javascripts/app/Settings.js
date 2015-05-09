app.Settings = Backbone.View.extend({
	el: '#main-wrapper',

	events: {
		'click button.add': 'addItem',
		'click .destroy': 'removeItem',
		// 'click #save': 'saveDataToServer',
		'sync': 'saved',
		'change .js-input-item.color-picker': 'trackChanges',
		'keyup .js-input-item[type="text"]': 'trackChanges',
		'change .js-input-item[data-type="select"]': 'trackChanges',
		'click .input-action-btn[data-which="cancel"]': 'revertToPreviousSettingVal',
		'click .input-action-btn[data-which="save"]': 'saveModel'
	},

	initialize: function(){

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');

		// Instantiate settings view
		this.instantiate();
	},

	instantiate: function(){
		this.bakeInputActions();
		// console.log(this.model.toJSON());
		// var markup = templates.settingsFactory( this.model.toJSON() );
		// this.$content.html(markup);
		this.initColorPicker(this.$content);

		return this;
	},

	// writeFormData: function($parentForm){
	// 	return JSON.stringify(this.getCurrentFormData($parentForm));
	// },

	getSavedFormData: function($parentForm){
		return JSON.parse($parentForm.attr('data-saved-settings'));
	},

	getRelevantSavedFormData: function($parentForm){
		// Our saved form data includes things that we aren't asking for input in the form such as org id
		// We use this function when we want to replace the data in the form with the saved data,
		// but we only need to ask for the keys that are used in the input
		// which we can take from the serialized form
		// That object has the right keys but bad values
		// So for each of its keys, grab the saved values

		var form_keys = Object.keys(this.getCurrentFormData($parentForm));
		var saved_data = this.getSavedFormData($parentForm);

		return _.pick(saved_data, form_keys);

	},

	getCurrentFormDataFull: function($parentForm){
		return _.extend(this.getSavedFormData($parentForm), $parentForm.serializeJSON());
	},

	getCurrentFormData: function($parentForm){
		return $parentForm.serializeJSON();
	},

	compareFormData: function($parentForm){
		var saved_data = this.getSavedFormData($parentForm),
				current_data = this.getCurrentFormDataFull($parentForm),
				changed = !_.isEqual(saved_data, current_data);

		console.log(changed, saved_data, current_data)

		return changed;
	},

	bakeInputActions: function(){
		var that = this;
		$('.js-parent-form').each(function(){
			var $parentForm = $(this),
					buttons_markup = templates.inputActionsFactory({}), // Our template accepts no data options
					changed = that.compareFormData($parentForm);

			// This determines, via css, whether the cancel/save buttons container appears.
			// if someone refreshes the settings pages and has inputted new settings but not saved them
			// many browsers will preserve the data in the input fields
			// but the save buttons won't appear unless `data-changed` is set to true
			$parentForm.attr('data-changed', changed.toString());

			$parentForm.append(buttons_markup);
		});
		return this;
	},

	trackChanges: function(e){
		var $inputItem 	= $(e.currentTarget),
				$parentForm = $inputItem.parents('.js-parent-form'),
				changed = this.compareFormData($parentForm);

		this.setDataChanged($parentForm, changed);
		return this;
	},

	setDataChanged: function($parentForm, show){
		$parentForm.attr('data-changed', show.toString());
		return this;
	},

	revertToPreviousSettingVal: function(e){
		var $parentForm = $(e.currentTarget).parents('.js-parent-form'),
				previous_data = this.getRelevantSavedFormData($parentForm);

		$parentForm.attr('data-changed', 'false');

		var set_actions = {
			text: function($el, val){
				$el.val(val);
				return this;
			},
			color: function($el, val){
				$el.spectrum('set', val);
			}
		};

		_.each(previous_data, function(val, name){
			// Figure out the type of tag this is
			var $el = $parentForm.find('[name="'+name+'"]');
			var input_type = $el.prop('tagName').toLowerCase();

			if (input_type == 'input'){
				input_type = $el.attr('type');
				if (input_type == 'text' && $el.attr('name') == 'color'){
					input_type = 'color';
				}
			}

			set_actions[input_type]($el, val);
		});

		return this;
	},

	saveModel: function(e){
		var that = this,
				$saveBtn = $(e.currentTarget),
				$parentForm = $saveBtn.parents('.js-parent-form'),
				$inputsContainer = $saveBtn.parents('.js-inputs-container'),
				data_key_to_save = $inputsContainer.attr('data-setting-name'),
				data_value_to_save = $parentForm.find('.js-input-item').val(),
				model_data = {
					name: data_key_to_save,
					value: data_value_to_save
				};

		var model_to_save = new models.setting.Model(model_data);

		model_to_save.save(null, {
			success: function(model, response, options){
				console.log('success');
				that.setDataChanged($parentForm, false);
				$parentForm.attr('data-saved-setting', that.getFormAsString($parentForm));
			},
			error: function(model, response, options){
				alert('Error saving model');
			},
		});

		return this;

	},

	initColorPicker: function($el){
		var that = this;
		$el.find('.color-picker').each(function(){
			var group = $(this).parents('.js-inputs-container').attr('data-group').split('-')[0]; // 'subject-tags' => 'subject'
			$(this).spectrum({
				preferredFormat: "hex",
				showPaletteOnly: true,
				hideAfterPaletteSelect: true,
				palette: that.palettes[group],
				change: function(color){
					// Save the hex back to the object for reading back laters
					$(this).val(color.toHexString());
				}
			});
		});
	},

	palettes: {
		subject: [
			['#1f78b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
			['#aec7e8','#ffbb78','#98df8a','#ff9896','#c5b0d5','#c49c94','#f7b6d2','#c7c7c7','#dbdb8d','#9edae5']
		],
		impact: [
			['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
		]
	},

	// addItem: function(e){
	// 	var $btn = $(e.currentTarget),
	// 			is_first = $btn.attr('data-first');

	// 	// Make the `create`
	// 	if (is_first === 'true'){
	// 		$btn.attr('data-first', 'false');
	// 		$btn.html('+');
	// 	}

	// 	var $inputsContainer = $btn.siblings('.inputs-container'),
	// 			new_item = {},
	// 			placeholders,
	// 			$newItem;

	// 	new_item.flag = $inputsContainer.attr('data-flag');
	// 	new_item.group = $inputsContainer.attr('data-group');
	// 	new_item.keys = [];
	// 	$inputsContainer.find('.input-item').each(function(){
	// 		new_item.keys.push($(this).attr('data-key'));
	// 	});

	// 	if ($inputsContainer.attr('data-layout') == 'double'){
	// 		// placeholders = JSON.parse( $inputsContainer.attr('data-placeholder') );
	// 		// new_item.keys = JSON.parse( $inputsContainer.attr('data-child-keys') );
	// 		// new_item.placeholder0 = placeholders[0];
	// 		// new_item.placeholder1 = placeholders[1];
	// 		// $inputsContainer.append( templates.multiInputDoubleFactory(new_item) );
	// 	} else if (($inputsContainer.attr('data-layout') == 'impact-tags')) {
	// 		// new_item.placeholder = $inputsContainer.attr('data-placeholder');
	// 		// $newItem = $(templates.impactTagInputFactory(new_item))
	// 		// $newItem.appendTo($inputsContainer);
	// 		// // if (new_item.flag == 'color'){
	// 		// this.initColorPicker($newItem);
	// 		// }
	// 	} else if ($inputsContainer.attr('data-child-keys')){
	// 		new_item.placeholder = $inputsContainer.attr('data-placeholder');
	// 		new_item.keys = JSON.parse($inputsContainer.attr('data-child-keys'));
	// 		$newItem = $(templates.multiInputFactory(new_item));
	// 		$newItem.appendTo($inputsContainer);
	// 		if (new_item.flag == 'color'){
	// 			this.initColorPicker($newItem);
	// 		}
	// 	} else {
	// 		console.log('there')
	// 		// new_item.placeholder = $inputsContainer.attr('data-placeholder');
	// 		// $newItem = $(templates.singleInputFactory(new_item))
	// 		// $newItem.appendTo($inputsContainer);
	// 	}
	// },

	removeItem: function(e){
		var $thisInput = $(e.currentTarget).parents('li.input.multi');
		$thisInput.remove();
	},

	// saveDataToServer: function(){
	// 	var settings = this.getSettingsData();
	// 	var valid = this.validateSettings(settings);
	// 	// Fill in any missing settings so we can fully delete things
	// 	var existing_keys = Object.keys(settings),
	// 			desired_keys = ["rss_feeds", "twitter_staff_lists", "twitter_users", "subject_tags", "impact_tags"];

	// 	var missing_keys = _.difference(desired_keys,existing_keys);

	// 	missing_keys.forEach(function(missingKey){
	// 		settings[missingKey] = [];
	// 	});

	// 	var $submitMsg = $('.submit-msg');

	// 	if (valid){
	// 		console.log('Posting settings...', settings);
	// 		this.model.save(settings, {
	// 			error: function(model, response, options){
	// 				console.log('error in model save', response)
	// 				$submitMsg
	// 					.addClass('fail')
	// 					.html('Failed!');
	// 			},
	// 			success: function(model, response, options){
	// 				console.log('saved in model save', response);
	// 				$submitMsg
	// 					.addClass('success')
	// 					.html('Saved! Refreshing...');

	// 				setTimeout(function(){
	// 					window.location.reload();
	// 				}, 300)
	// 			}
	// 		});
	// 	} else {
	// 		$submitMsg
	// 			.addClass('fail')
	// 			.html('Passwords do not match. Please try again.')
	// 	}
	// },

	// getSettingsData: function(){
	// 	var settings = {},
	// 			$inputContainers = this.$el.find('.inputs-container');
	// 	$inputContainers.each(function(i){
	// 		var $this = $(this),
	// 				key = $this.attr('data-key'),
	// 				$inputs = $this.find('.input'),
	// 				input_val;

	// 		if ( !$inputs.hasClass('multi') ){
	// 			// Only enter it if it's not empty
	// 			input_val = $inputs.find('.input-item').val();
	// 			if ( input_val && input_val.trim() ) {
	// 				settings[key] = input_val.trim();
	// 			}
	// 		} else {
	// 			$inputs.each(function(){
	// 				var input_obj = {},
	// 						val_collection = [];
	// 				$(this).find('.input-item').each(function(){
	// 					var $this = $(this),
	// 					    input_key = $this.attr('data-key');

	// 					// Get the val based on the input type it is
	// 					var val,
	// 							type = $this.attr('type');

	// 					// If its a radio or checkbox, access its val with the checked property
	// 					// Otherwise it's a text field so get its .val()
	// 					if (type == 'radio' || type == 'checkbox'){
	// 						val = $this.prop('checked');
	// 					} else {
	// 						val = $this.val();
	// 					}

	// 					// Cut off the fat
	// 					if (typeof val == 'string') val = val.trim();

	// 					if (input_key) {
	// 						input_obj[input_key] = val;
	// 						// If it has a id key, add that also
	// 						if ($this.attr('data-id')){
	// 							var id = $this.attr('data-id');
	// 							if (id === 'false') id = null
	// 							input_obj['id'] = parseFloat(id);
	// 						}
	// 					} else {
	// 						input_obj = val;
	// 					}
	// 					val_collection.push(val);
	// 				});

	// 				if ( !_.some(val_collection, function(d) { return _.isEmpty(d) && !_.isBoolean(d) } ) ){
	// 					if (!settings[key]) settings[key] = [];
	// 					settings[key].push(input_obj)
	// 				}
	// 			})
	// 		}
	// 	});
	// 	return settings;
	// },

	reportError: function(msg){
		// alert(msg);
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