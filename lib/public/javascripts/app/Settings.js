app.Settings = Backbone.View.extend({
	el: '#main-wrapper',

	events: {
		'click button.add': 'addItem',
		'click .destroy': 'removeItem',
		'click #save': 'saveDataToServer',
		'sync': 'saved'
	},

	initialize: function(){

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');

		// Instantiate settings view
		this.instantiate();
	},

	saved: function(){
		console.log('saved in view')
	},
	instantiate: function(){
		var markup = templates.settingsFactory( this.model.toJSON() );
		this.$content.html(markup);
		this.initColorPicker(this.$content);
	},

	initColorPicker: function($el){
		var that = this;
		$el.find('.color-picker').each(function(){
			var group = $(this).attr('data-group');
			$(this).spectrum({
				preferredFormat: "hex",
				showInput: true,
				showPalette: true,
				chooseText: 'Choose',
				palette: [that.palettes[group]],
				change: function(color){
					// Save the hex back to the object for reading back laters
					$(this).val(color.toHexString());
				}
			});
		});
	},

	palettes: {
		subject: ['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928','#a6cee3','#b2df8a','#fb9a99','#fdbf6f','#cab2d6'],
		impact: ['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
	},

	addItem: function(e){
		var $inputsContainer = $(e.currentTarget).siblings('.inputs-container'),
				new_item = {},
				placeholders,
				$newItem;

		new_item.flag = $inputsContainer.attr('data-flag');
		new_item.group = $inputsContainer.attr('data-group');
		new_item.keys = [];
		$inputsContainer.find('.input-item').each(function(){
			new_item.keys.push($(this).attr('data-key'));
		});
		if ($inputsContainer.attr('data-layout') == 'double'){
			placeholders = JSON.parse( $inputsContainer.attr('data-placeholder') );
			new_item.placeholder0 = placeholders[0];
			new_item.placeholder1 = placeholders[1];
			$inputsContainer.append( templates.multiInputDoubleFactory(new_item) );
		} else if (($inputsContainer.attr('data-layout') == 'impact-tags')) {
			new_item.placeholder = $inputsContainer.attr('data-placeholder');
			$newItem = $(templates.impactTagInputFactory(new_item))
			$newItem.appendTo($inputsContainer);
			// if (new_item.flag == 'color'){
			this.initColorPicker($newItem);
			// }
		} else {
			new_item.placeholder = $inputsContainer.attr('data-placeholder');
			new_item.keys = JSON.parse($inputsContainer.attr('data-child-keys'));
			$newItem = $(templates.multiInputFactory(new_item))
			$newItem.appendTo($inputsContainer);
			if (new_item.flag == 'color'){
				this.initColorPicker($newItem);
			}
		}
	},

	removeItem: function(e){
		var $thisInput = $(e.currentTarget).parents('li.input.multi');
		$thisInput.remove();
	},

	saveDataToServer: function(){
		var settings = this.getSettingsData();
		var valid = this.validateSettings(settings);
		// Fill in any missing settings so we can fully delete things
		var existing_keys = Object.keys(settings),
				desired_keys = ["rss_feeds", "twitter_staff_lists", "twitter_users", "subject_tags", "impact_tags"];

		var missing_keys = _.difference(desired_keys,existing_keys);

		missing_keys.forEach(function(missingKey){
			settings[missingKey] = [];
		});

		if (valid){
			console.log('Posting settings...', settings);
			this.model.save(settings, {
				error: function(model, response, options){
					console.log('error in model save', response)
				},
				success: function(model, response, options){
					console.log('saved in model save', response);
				}
			});
		}
	},

	getSettingsData: function(){
		var settings = {},
				$inputContainers = this.$el.find('.inputs-container');
		$inputContainers.each(function(i){
			var $this = $(this),
					key = $this.attr('data-key'),
					$inputs = $this.find('.input'),
					input_val;

			if ( !$inputs.hasClass('multi') ){
				// Only enter it if it's not empty
				input_val = $inputs.find('.input-item').val();
				if ( input_val && input_val.trim() ) {
					settings[key] = input_val.trim();
				}
			} else {
				$inputs.each(function(){
					var input_obj = {},
							val_collection = [];
					$(this).find('.input-item').each(function(){
						var $this = $(this),
						    input_key = $this.attr('data-key');

						// Get the val based on the input type it is
						var val,
								type = $this.attr('type');

						// If its a radio or checkbox, access its val with the checked property
						// Otherwise it's a text field so get its .val()
						if (type == 'radio' || type == 'checkbox'){
							val = $this.prop('checked');
						} else {
							val = $this.val();
						}

						// Cut off the fat
						if (typeof val == 'string') val = val.trim();

						if (input_key) {
							input_obj[input_key] = val;
							// If it has a id key, add that also
							if ($this.attr('data-id')){
								var id = $this.attr('data-id');
								if (id === 'false') id = null
								input_obj['id'] = parseFloat(id);
							}
						} else {
							input_obj = val;
						}
						val_collection.push(val);
					});

					if ( !_.some(val_collection, function(d) { return _.isEmpty(d) && !_.isBoolean(d) } ) ){
						if (!settings[key]) settings[key] = [];
						settings[key].push(input_obj)
					}
				})
			}
		});
		return settings;
	},
	reportError: function(msg){
		alert(msg);
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