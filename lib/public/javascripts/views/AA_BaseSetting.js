views.AA_BaseSetting = Backbone.View.extend({

	events: {
		'change .js-input-item.color-picker': 'inputHasChanged',
		'keyup .js-input-item[type="text"]': 'inputHasChanged',
		'change select.js-input-item': 'inputHasChanged',
		'click .input-action-btn[data-which="cancel"]': 'revertToPreviousSettingVal',
		'click .input-action-btn[data-which="save"]': 'saveModel',
		'click .destroy': 'destroyModel'
	},

	keepPreviousValueIfExists: false,

	initializeBase: function(){

		// Cache selectors
		this.$form = this.$el.find('form');

		// Listen for model changes to show or hide buttons
		this.listenTo(this.model, 'change:input_val', this.compareFormData);
		this.listenTo(this.model, 'change:data_changed', this.setDataChanged);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'error', this.error);

		return this;

	},

	remove: function(){
		this.$el.animate({
			opacity: 0
		}, 400, 'easeOutQuart').animate({
			height: 0
		}, 175, 'easeOutQuart')
		.queue(function(next) { 
				$(this).remove();
				next(); 
		});

		return this;
	},

	error: function(model, error){
		console.log('Error saving or destroying model');
		console.log(error);
		return this;
	},

	postRender: function(){

		// Add cancel and save buttons
		this.bakeInputActions();

		// Determine whether this data is changed or not on load
		// Most browsers will preserve the values in the input field on page refresh
		// This will let us know if those values on load are different from what's stored in our data model
		this.compareFormData();

		return this;
	},

	inputHasChanged: function(model){
		var incoming_val = this.getCurrentFormData();
		this.model.set('input_val', incoming_val);

		return this;
	},

	compareFormData: function(){
		var saved_data = this.getRelevantSavedFormData(),
				current_data = this.getCurrentFormData(),
				data_is_different = !_.isEqual(saved_data, current_data);

		this.model.set('data_changed', data_is_different);

		return this;
	},

	setDataChanged: function(model, value){
		this.$form.attr('data-changed', value.toString());
		return this;
	},

	getCurrentFormData: function(){
		var form_data = this.$form.serializeJSON();
		var standardized_form_data = this.standardizeEmptyFields(form_data);
		return standardized_form_data;
	},

	getRelevantSavedFormData: function(){
		// Our saved form data includes things that we aren't asking for input in the form such as org id
		// We use this function when we want to replace the data in the form with the saved data,
		// but we only need to ask for the keys that are used in the input
		// which we can take from the serialized form
		// That object has the right keys but bad values
		// So for each of its keys, grab the saved values

		var form_keys = Object.keys(this.getCurrentFormData());
		var saved_data = this.model.toJSON();

		var input_fields_in_saved_data = _.pick(saved_data, form_keys);

		return input_fields_in_saved_data;

	},

	standardizeEmptyFields: function(obj) {
     var clone = _.clone(obj);
     _.each(clone, function(val, key) {
       if(!val) {
         clone[key] = null;
       } else if (_.isObject(val)) {
       	clone[key] = this.standardizeEmptyFields(val);
       }
     }, this);
     return clone;
  },


	bakeInputActions: function(){
		var $form = this.$form;
		var buttons_markup = templates.inputActionsFactory({}); // Our template accepts no data options

		$form.append(buttons_markup);

		return this;
	},

	initColorPicker: function(group){
		var that = this;
		this.$el.find('.color-picker').each(function(){
			var $colorPicker = $(this);
			$colorPicker.spectrum({
				preferredFormat: "hex",
				showPaletteOnly: true,
				hideAfterPaletteSelect: true,
				palette: that.palettes[group],
				change: function(color){
					// Save the hex back to the object for reading back laters
					$colorPicker.val(color.toHexString());
				}
			});
		});

		return this;
	},

	getVal: function(dataLocation){
		var location = dataLocation || this.valueKey || this.options.valueKey,
				value_keys = location.replace(/\]/g, '').split('['),
				relevant_saved_data = this.getRelevantSavedFormData(),
				first_val = _.first(value_keys),
				val = relevant_saved_data[first_val]; 

		// Protect against nested values on new item creation
		var new_obj = {};
		if (_.isEmpty(relevant_saved_data) && value_keys.length > 1){
			new_obj[first_val] = {};
			val = new_obj;
		}

		// If we have specified any other values through a syntax of `key[nested_key][other_nested_key]`, then loop through them and replace the val
		_.chain(value_keys).rest().each(function(valueKey){
			val = val[valueKey];
		}, this).value();
		return val;
	},

	revertToPreviousSettingVal: function(e){
		e.preventDefault();
		var $form = this.$form,
				previous_data = this.getRelevantSavedFormData(),
				that = this;

		this.model.set('data_changed', 'false');

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

		$form.find('input[type="text"],select').each(function(){
			var $input = $(this);
			var data_location = $input.attr('name');
			var val = that.getVal(data_location);

			var set_action = 'normal';
			if (data_location == 'color'){
				set_action = 'color';
			}
			set_actions[set_action]($input, val);

		});

		return this;
	},

	palettes: {
		'subject-tag': [
			['#1f78b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
			['#aec7e8','#ffbb78','#98df8a','#ff9896','#c5b0d5','#c49c94','#f7b6d2','#c7c7c7','#dbdb8d','#9edae5']
		],
		'impact-tag': [
			['#6699cc','#66cccc','#99cc99','#cc99cc','#d27b53','#f2777a','#f99157','#ffcc66','#bc80bd','#ccebc5','#ffed6f']
			// ['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
		]
	},

	assembleInputsData: function(keys){
		var input_data_object = keys.map(function(key){
			return {
				$input: this.$form.find('.js-input-item[name="'+key+'"]'),
				val: this.model.get(key)
			};
		}, this);

		return input_data_object;

	},

	saveModel: function(e){
		e.preventDefault();
		var that = this;
		var attrs_to_save = this.getCurrentFormData();
		// console.log('saving attrs', attrs_to_save);
		this.model.save(attrs_to_save, {
			// patch: true,
			success: function(){
				that.modelSaved(true);
			},
			error: function(){
				console.log('error');
				that.modelSaved(false);
			}
		});

		return this;
	},

	modelSaved: function(saveSuccess){
		this.model.set('data_changed', !saveSuccess);

		if (saveSuccess){
			this.$form.attr('data-new', 'false');
			this.$el.removeClass('js-destroy-wait');
		}

		return this;

	},

	destroyModel: function(){
		this.$el.addClass('js-destroy-wait');
		this.model.destroy({wait: true});
	}


});

