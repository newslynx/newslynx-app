app.Settings = Backbone.View.extend({
	el: '#main-wrapper',

	events: {
		'click button.add': 'addItem',
		'click .destroy': 'removeItem',
		// 'click #save': 'saveDataToServer',
		'sync': 'saved',
		'change .js-input-item.color-picker': 'trackChanges',
		'keyup .js-input-item[type="text"]': 'trackChanges',
		'change select.js-input-item': 'trackChanges',
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

	writeFormData: function($parentForm, data){
		var string_data = JSON.stringify( _.extend(this.getCurrentFormDataFull($parentForm), data) );
		$parentForm.attr('data-saved-settings', string_data);
	},

	getSavedFormData: function($parentForm){
		// console.log($parentForm.attr('data-saved-settings'))
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
		var saved_data = this.getRelevantSavedFormData($parentForm),
				current_data = this.getCurrentFormData($parentForm),
				changed = !_.isEqual(saved_data, current_data);

		if (changed){
			console.log(changed, saved_data, current_data)
			
		}

		return changed;
	},

	bakeInputActions: function($parentFormsOrSingle){
		var that = this;
		$parentFormsOrSingle = $parentFormsOrSingle || $('.js-parent-form');
		$parentFormsOrSingle.each(function(){
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
			normal: function($el, val){
				// Most elements like `input` tags and `select` tags can be set through `$el.val()`
				$el.val(val);
				return this;
			},
			color: function($el, val){
				// Our color picker is special, however
				$el.spectrum('set', val);
				return this;
			}
		};

		_.each(previous_data, function(val, name){
			var $el = $parentForm.find('[name="'+name+'"]'),
					input_type = 'normal';

			if ($el.attr('name') == 'color'){
				input_type = 'color';
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
				which_model = $inputsContainer.attr('data-model'),
				model_data = this.getCurrentFormDataFull($parentForm);

		console.log(model_data)

		var model_to_save = new models[which_model].Model(model_data);

		model_to_save.save(null, {
			success: function(model, response, options){
				console.log('success');
				that.setDataChanged($parentForm, false);
				that.writeFormData($parentForm, {id: model.get('id')});
				$parentForm.attr('data-new', 'false');
			},
			error: function(model, response, options){
				console.log('Error saving model');
				console.log(response);
			},
		});

		return this;

	},

	initColorPicker: function($el){
		var that = this;
		$el.find('.color-picker').each(function(){
			var group = $(this).parents('.js-inputs-container').attr('data-model'); // `'subject_tag'` or `'impact_tag'`
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
		subject_tag: [
			['#1f78b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
			['#aec7e8','#ffbb78','#98df8a','#ff9896','#c5b0d5','#c49c94','#f7b6d2','#c7c7c7','#dbdb8d','#9edae5']
		],
		impact_tag: [
			['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
		]
	},

	addItem: function(e){
		var $btn = $(e.currentTarget),
				is_first = $btn.attr('data-first');

		// Make the `create` button turn into a `'+'` button
		if (is_first === 'true'){
			$btn.attr('data-first', 'false');
			$btn.html('+');
		}

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				template_group_name = $inputsContainer.attr('data-model'),
				templateFactory = templates[template_group_name+'Factory'];

		var $new_item = $( templateFactory({}) );
		$new_item.appendTo($inputsContainer);
		var $parentForm = $new_item.find('.js-parent-form');
		$parentForm.attr('data-new', 'true');
		// If it has a color picker
		if ($new_item.find('.js-input-item[name="color"]').length){
			this.initColorPicker($new_item);
		}
		this.bakeInputActions($parentForm);

	},

	removeItem: function(e){
		var $thisInput = $(e.currentTarget).parents('li'),
				$parentForm = $thisInput.find('.js-parent-form'),
				$inputsContainer = $parentForm.parents('.js-inputs-container'),
				which_model,
				model_data,
				model_to_delete;

		// If this is new, aka, we haven't saved it to the server yet,
		// just remove it
		if ($parentForm.attr('data-new') === 'true'){
			$thisInput.remove();
		} else {
			which_model = $inputsContainer.attr('data-model'),
			model_data = this.getCurrentFormDataFull($parentForm);

			console.log(which_model, model_data)

			model_to_delete = new models[which_model].Model(model_data);

			model_to_delete.destroy({
				success: function(model, response, options){
					console.log('Success');
					console.log(model)
					console.log(response)
					$thisInput.remove();
				},
				error: function(model, response, options){
					console.log('Error');
					console.log(model)
					console.log(response)
				}
			})
		}

	

		// TODO, delete model on server if this has `data-new="false"`
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