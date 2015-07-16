views.AA_BaseSetting = Backbone.View.extend({

	events: {
		'change .js-input-item.color-picker': 'inputHasChanged',
		'keyup .js-input-item': 'inputHasChanged',
		'keypress .js-input-item': 'inputHasChangedFromKeypress',
		'change .js-input-item': 'inputHasChanged',
		'click .js-input-item': 'inputHasChanged',
		'change select.js-input-item': 'inputHasChanged',
		'click .input-action-btn[data-which="cancel"]': 'revertToPreviousSettingVal',
		'submit .js-parent-form': 'saveModel',
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .multi-child.js-destroy': 'toggleModal',
		'click input.js-destroy': 'destroyModel'
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
		this.listenTo(this.model, 'invalid', this.error);

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
		console.log('####### MODEL SAVE ERRROR #######');
		console.log(model.toJSON());
		console.log(JSON.stringify(error));
		console.log('####### end model save error #######');
		alert('There was an error saving. Please open your console and paste the output to merlynne@newslynx.org. Or follow its instructions if present.');
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

	inputHasChanged: function(e){
		// e.preventDefault();
		e.stopPropagation();
		// Save the input to an attribute unless we just hit the return key
		// In that case, submit the form
		var return_key_code = 13,
				esc_key_code = 27,
				command_key_modifying = e.metaKey,
				incoming_val;

		if (e.keyCode == esc_key_code){
			this.revertToPreviousSettingVal(e);
		} else {
			incoming_val = this.getCurrentFormData();
			this.model.set('input_val', incoming_val);
		}


		return this;
	},

	inputHasChangedFromKeypress: function(e){
		var return_key_code = 13,
				command_key_modifying = e.metaKey;

		if (e.keyCode == return_key_code && command_key_modifying) {
			this.saveModel(e);
		} else if (e.keyCode == return_key_code && !command_key_modifying){
			e.preventDefault();
			e.stopPropagation();
		}

	},

	compareFormData: function(){
		var saved_data = this.getRelevantSavedFormData(),
				current_data = this.model.get('input_val') || this.getCurrentFormData(),
				data_is_different = !_.isEqual(saved_data, current_data);

		// console.log('saved',saved_data)
		// console.log('current',current_data)

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

		var f = $.serializeJSON,
				data_object = $.extend(true, {}, this.model.toJSON()),
				opts = f.setupOpts({}),
				keys_list = [],
				output_object = {};

		this.$form.find('input,select').each(function(){
			var input_name = $(this).attr('name'),
					keys;

			if (input_name){
			  keys = f.splitInputNameIntoKeysArray(input_name, opts);
				keys_list.push(keys);
			}

		});

		var keys_value_list = keys_list.map(function(keys){
			var type = keys.pop(); // Remove the last value, which is its caster
			// TODO, maybe do something with type to cast vars
	  	var val = this.deepGet(data_object, keys);
      return {keys: keys, value: val}
		}, this);

		keys_value_list.forEach(function(keysValue){
			f.deepSet(output_object, keysValue.keys, keysValue.value, opts);
		}, this);

		return output_object;

	},

	standardizeEmptyFields: function(obj) {
     var clone = _.clone(obj);
     _.each(clone, function(val, key) {
       if(!val) {
         clone[key] = ''; // Set this to empty string, which will fire a change event on load, showing the cancel and save buttons, per https://github.com/newslynx/opportunities/issues/33
       } else if (_.isObject(val)) {
       	clone[key] = this.standardizeEmptyFields(val);
       }
     }, this);
     return clone;
  },


	bakeInputActions: function(){
		var $form = this.$form;
		var buttons_markup = templates.inputActionsFactory({}); // Our template accepts no data options
		var $modal = $( templates.modalFactory({}) );

		$modal.appendTo($form);
		$form.append(buttons_markup);

		var drag = d3.behavior.drag()
					.on('drag', function(d,i,e) {
						// FF has a bug where it will allow for drag when the mouse is selected text in an input field
						// This means that if you try to click and select text, it will move the window
						// Same thing on the scrollbar of the impact tags
						// As a fix, disable all dragging if you're within an input child
						if (this.canDrag){
							var D3_modal_inner = d3.select(this).select('.modal-inner'),
									top = parseInt(D3_modal_inner.style('top')),
									left = parseInt(D3_modal_inner.style('left'));

							top += d3.event.dy;
							left += d3.event.dx;

							D3_modal_inner.style('top', top+'px').style('left', left+'px');
							
						}
					})
					.on('dragstart', function(){
						var elements_to_not_drag = ['.form-row-input-container'],
								$dragging_element = $(d3.event.sourceEvent.explicitOriginalTarget);

						var can_drag = _.every(elements_to_not_drag, function(elementToDrag){
							if ($dragging_element.hasClass(elementToDrag.replace('.',''))){
								return false;
							} else if ($dragging_element.parents(elementToDrag).length > 0){
								return false;
							} else {
								return true;
							}
						});

						this.canDrag = can_drag;

					})

		d3.select($modal[0]).call(drag);

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
		var f = $.serializeJSON,
				opts = f.setupOpts({}),
				location = dataLocation || this.valueKey || this.options.valueKey,
				value_keys = f.splitInputNameIntoKeysArray(dataLocation, opts),
				saved_data = this.model.toJSON();//,
		
		var type = value_keys.pop();
		// TODO, do something with type, perhaps
		var val = this.deepGet(saved_data, value_keys);

		return val;
	},

	deepGet: function(dataObj, keys, returnObjBool){
		dataObj = $.extend(true, {}, dataObj);
		// Protect against nested values on new item creation
		// This happens if we're looking for a value nested under a key that does not yet exist
		var val;
		if ( (_.isEmpty(dataObj) || !dataObj[keys[0]]) && keys.length > 1){
			val = {};
			val[keys[0]] = {};
		} else {
			val = dataObj[keys[0]];
		}

		// If we have specified any other values through a syntax of `key[nested_key][other_nested_key]`, then loop through them and replace the val
		_.chain(keys).rest().each(function(nextKey){
			val = val[nextKey];
		}, this).value();

		return val;
	},

	setVals: function(vals){
		vals = vals || [this.options.valueKey];

		var inputs_data = this.assembleInputsData(vals);

		inputs_data.forEach(function(inputData){
			var $input = inputData.$input;
			var val = inputData.val;

			var existing_value = $input.val() || '';

			if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
				$input.val(val);
			}

		}, this);


		return this;
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
				val: this.getVal(key)
			};
		}, this);

		return input_data_object;

	},

	saveModel: function(e){
		e.preventDefault();

		if (this.preSaveHook){
			this.preSaveHook();
		}

		var that = this;
		var attrs_to_save = this.getCurrentFormData(),
				existing_attrs;


		if (attrs_to_save.options){
			existing_attrs = _.pick(this.model.get('options'), function(option){
				// Only keep the truthy values, unless one is `0`, which is falsey but for our purposes is important
				var keep;
				if (option === 0){
					keep = true;
				} else {
					keep = option;
				}
				return keep;
			});
			attrs_to_save.options = _.extend(existing_attrs, attrs_to_save.options);
		}

		this.model.save(attrs_to_save, {
			patch: true,
			success: function(){
				that.modelSaved(true);
			},
			error: function(){
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
			if (this.postSaveHook){
				this.postSaveHook();
			}
			this.$form.addClass('js-just-saved').delay(1500)
																					.queue(function(next) { 
																							$(this).removeClass('js-just-saved');
																							next(); 
																					});


		}

		return this;

	},

	destroyModel: function(e){
		this.toggleModal(e);
		this.$el.addClass('js-destroy-wait');
		this.model.destroy({wait: true});
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	}


});

