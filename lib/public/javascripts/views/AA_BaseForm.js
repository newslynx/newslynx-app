views.AA_BaseForm = Backbone.View.extend({

	events: {
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .article-assignee': 'removeArticleAssignee',
		// 'keyup .assignees-selector': 'assigneesInputHasChanged'
		// 'change select': 'recordDropdownChange',
		// 'change input': 'recordInputChange',
		// 'change textarea': 'recordInputChange'
	},

	killPropagation: function(e){
		e.stopPropagation();
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	assignmentTemplateFactory: _.template('<div class="article-assignee""><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\'/></div>'),
	setAssignmentTemplateFactory: _.template('<div class="article-assignee""><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="set_event_content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\'/></div>'),

	bakeModal: function(title){
		var modal_markup = '';
		modal_markup += '<div class="modal-outer">';
			modal_markup += '<div class="modal-overlay"></div>';
			modal_markup += '<div class="modal-inner">';
				modal_markup += '<div class="modal-title">'+title+'</div>';
				modal_markup += '<form></form>';
			modal_markup += '</div>';
		modal_markup += '</div>';

		this.$el.append(modal_markup);
		this.$form = this.$el.find('form');
		return this;
	},

	refresh: function(disableTitleSearch, disablePikaday){
		this.render();
		this.postRender(disableTitleSearch, disablePikaday);
	},

	postRender: function(disableTitleSearch, disablePikaday, setEventMode){
		if (!disableTitleSearch) { this.initArticleTitleSearcher(setEventMode); }
		if (!disablePikaday) { this.initPikaday(); }
		this.$submitMsgText = this.$el.find('.submit-msg');

		var el_modal_outer = this.$el.find('.modal-outer')[0];

		d3.select(el_modal_outer).call(this.drag);

		return this;
	},

	bakeFormInputRow: function(fieldName, data, isDefaultEvent){
		var groups = {
			time_of_day: 'schedule_by',
			crontab: 'schedule_by',
			minutes: 'schedule_by'
		};

		var type = data.input_type,
				is_hidden = (type == 'hidden'),
				field_name_pp = this.prettyName(fieldName),
				which_name = this.removeSetEventPrefix(fieldName),
				markup = '',
				has_help_link = (data.help && data.help.link),
				has_help_desc = (data.help && data.help.description),
				skipped_fields = ['slug'],
				group = groups[which_name] || '';

		isDefaultEvent = isDefaultEvent || false;

		if (!_.contains(skipped_fields, fieldName)){
			// Bake the general row container, the label and the input container
			markup = '<div class="form-row" data-which="'+which_name+'" data-group="'+group+'" data-hidden="'+is_hidden+'">';
				markup += '<div class="form-row-label-container '+((has_help_link) ? 'has-help-link' : '')+'">';
					markup += '<label for="'+fieldName+'"> '+field_name_pp+((has_help_desc) ? '<span class="tooltipped question-mark" aria-label="'+data.help.description+'">?</span>' : '' )+'</label> ';
				markup += '</div>';
				markup += '<div class="form-row-input-container" data-which="'+which_name+'">';
					if (has_help_link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">What do I put here?</a></div>'; 
					// Get the appropriate markup
					if (!this.formJsonToMarkup[type]){
						console.log('MISSING INPUT TYPE FOR ', type, fieldName, data);
					}
					markup += this.formJsonToMarkup[type].call(this, fieldName, data, isDefaultEvent);
				markup += '</div>';
			markup += '</div>';
		}

		return markup;
	},

	formJsonToMarkup: {

		search: function(fieldName, data, isDefaultEvent){
			// Rename the field name
			fieldName = 'assignees-selector';

			// Give this a normal text input now, minus the data value, we'll instantiate the article searcher and load selecteds after it's been added to the DOM
			var input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" data-is-default-event="'+isDefaultEvent+'" data-serialize-skip="true"/>';

			return input_markup;
		},

		// TODO, fix how this works differentiating `set_event_` template vs not.
		// article_assignees: function(assignees){
		// 	var markup = '';
		// 	assignees.forEach(function(assignee){
		// 		markup += this.assignmentTemplateFactory(assignee);
		// 	},this);
		// 	return markup;
		// },

		datepicker: function(fieldName, data, isDefaultEvent){
			var value,
					input_markup;

			var class_name = this.removeSetEventPrefix(fieldName);

			// Give this a normal timestamp input now, we'll instantiate pikaday after it's been added to the DOM
			input_markup = '<input type="text" name="'+fieldName+'" class="'+class_name+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" autocomplete="off" data-is-default-event="'+isDefaultEvent+'"/>';
			
			return input_markup;
		},

		textNumberOrHidden: function(fieldName, data, which, isDefaultEvent){
			// TODO, investigate why value needs to be double escaped for Brian's version of Chrome.
			var value = this.escapeQuotes(data.selected),
					class_name = this.removeSetEventPrefix(fieldName);

			var input_markup = '<input type="'+which+'" name="'+fieldName+':auto" class="'+class_name+'" value="'+this.escapeQuotes(value)+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" '+((which == 'number') ? 'min="0"' : '') +' data-is-default-event="'+isDefaultEvent+'"/>';
			
			return input_markup;
		},

		text: function(fieldName, data, isDefaultEvent){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'text', isDefaultEvent);
		},

		hidden: function(fieldName, data, isDefaultEvent){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'hidden', isDefaultEvent);
		},

		searchstring: function(fieldName, data, isDefaultEvent){
			// Do the same as text
			return this.formJsonToMarkup.text.call(this, fieldName, data, isDefaultEvent);
		},

		number: function(fieldName, data, isDefaultEvent){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'number', isDefaultEvent);
		},

		paragraph: function(fieldName, data, isDefaultEvent){
			var value = this.escapeQuotes(data.selected) || '',
					class_name = this.removeSetEventPrefix(fieldName);

			var input_markup = '<textarea type="text" name="'+fieldName+'" class="'+class_name+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" data-is-default-event="'+isDefaultEvent+'">'+value+'</textarea>';
			
			return input_markup;
		},

		select: function(fieldName, data, isDefaultEvent){
			var class_name = this.removeSetEventPrefix(fieldName);

			var input_markup = '<select class="'+class_name+'" name="'+fieldName+':auto" data-is-default-event="'+isDefaultEvent+'">';

			_.each(data.input_options, function(option){
				var selected = '';
				if (data.selected == option) selected = 'selected';
				input_markup += '<option value="'+option+'" '+selected+'>'+this.prettyName(option)+'</option>';
			}, this);
			input_markup += '</select>';
			
			return input_markup;
		},

		checkbox: function(fieldName, data, isDefaultEvent){
			var input_markup = '',
					namespacer = 'NewsLynx'; // To avoid id collisions

			if (!data.input_options.length){
				input_markup = '<span class="placeholder">You haven\'t yet made any '+fieldName.replace(/^set_event_/,'').replace(/_/g,' ')+' yet. Create them on the <a href="/settings" target="_blank" class="out-link">Settings</a> page.</span>';
			}

			_.each(data.input_options, function(checkboxItemObj){
				var style = this.styleCheckboxLabel(checkboxItemObj);
				var checkboxId = _.uniqueId(namespacer+'|'+fieldName + '|' + checkboxItemObj.id + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
				input_markup += '<div class="form-checkbox-group tags">';
					var checked = '';
					var selected_ids = data.selected;
					if (_.contains(selected_ids, checkboxItemObj.id)) checked = 'checked';
					input_markup += '<input class="tag" id="'+checkboxId+'" name="'+fieldName+'[]:number" value="'+checkboxItemObj.id+'" type="checkbox" ' + checked + ' data-is-default-event="'+isDefaultEvent+'"/>';
					input_markup += '<label class="tag" for="'+checkboxId+'" '+style+'>'+checkboxItemObj.name+'</label>';
				input_markup += '</div>';
			}, this);

			return input_markup;
		}

	},

	styleCheckboxLabel: function(checkboxItemObj){
		// console.log(checkboxItemObj, checkboxItemObj.color)
		var bgColor = checkboxItemObj.color,
				color = this.whiteOrBlack(bgColor);

		return 'style="background-color:'+bgColor+';color:'+color+';"';
	},

	prettyName: function(name){
		// Standardize name to remove the `set_event_` prefix used in keys on default event creator forms like when creating or modifying a recipe
		if (/^set_event_/.test(name)){
			name = name.replace('set_event_', '');
		}
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
		var name_changes = {
			'q': 'search_query',
			'content_items': 'Assign to..',
			'url': 'URL',
			'filter': 'search_query',
			'min_followers': 'min. followers',
			'tag_ids': 'impact tag(s)',
			'datetime': 'date / time',
			'interval': 'interval (seconds)',
			'title': 'event title'
		};

		if (name_changes[name]) {
			name = name_changes[name];
		}
		if (!name) {
			name = '';
		}
		name = name.replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
	},

	escapeQuotes: function(term){
		if (term === 0) { return term; }
		if (!term) { return ''; }
		if (typeof term !== 'string') { return term };
		return term.replace(/"/g,'&quot;')
	},

	prettyDatestamp: function(utcDate){
		return new Date(utcDate).toLocaleString();
	},

	initArticleTitleSearcher: function(setEventMode){
		var $typeahead = this.$el.find('.assignees-selector'),
				content_items_key = 'content_items',
				that = this;

		if (setEventMode){
			content_items_key = 'set_event_content_items';
		}

		this.$typeaheadRow = $typeahead.parents('.form-row');
		$('<div class="form-row article-assignees" ></div>').insertAfter(this.$typeaheadRow);

		$typeahead.typeahead({
			highlight: true,
			minLength: 3
		},{
			name: 'content-items',
			displayKey: 'title',
			async: true,
			source: app.bloodhound
		});

		$typeahead.on('typeahead:selected', function(e, d){
			e.preventDefault();
			// Clear this val on selection
			$(this).typeahead('val', '');
			// Add selection down below
			that.addArticleAssignee(d, setEventMode);
		});

		// Load the selecteds, if they exist
		// if (_.isArray(this.event_schema[content_items_key].selected)){
		// 	this.event_schema[content_items_key].selected.forEach(function(contentItem){
		// 		that.addArticleAssignee(contentItem, setEventMode);
		// 	});
		// }

		return this;
	},

	addArticleAssignee: function(d, setEventMode){
		var $articleAssignments,
				id,
				form_data,
				markup,
				templateFactory = this.assignmentTemplateFactory,
				content_items_key = 'content_items';

		// We have to change a couple of things to handle the different key names across different forms
		if (setEventMode){
			content_items_key = 'set_event_content_items';
			templateFactory = this.setAsignmentTemplateFactory
		}

		if (d){
			$articleAssignments = this.$el.find('.form-row.article-assignees');
			id = d.id;

			var form_data = this.getSettings(true);

			// Currently, selecting an article won't remove it from the typeahead options, so as a fix, don't add things if they already exist
			if (!_.contains(_.pluck(form_data[content_items_key], 'id'), id)){

				markup = templateFactory(d);
				$articleAssignments.append(markup);
			}
			
		} else {
			console.log('ERROR: Article assignee not found');
		}

		return this;
	},

	removeArticleAssignee: function(e){
		// Remove from DOM
		$(e.currentTarget).remove();
		return this;
	},

	initPikaday: function(){
		var time_picker,
				that = this,
				el = this.$el.find('input[name="datepicker"]')[0]; // Pikaday wants a pure dom object, not a jquery object

		time_picker = new Pikaday({
			field: el,
			clearInvalidInput: true,
			onSelect: function(){
				var this_date = this.getDate(),
						timestamp = this_date.getTime();
				// On change, save the timestamp to the el
				that.event_data.timestamp = timestamp/1000;
			},
			onClear: function(){
				// Clear the timestamp on error or non-date value
				that.event_data.timestamp = null;
			}
		});

		var selected_timestamp_as_date;
		if (this.event_schema && this.event_schema.timestamp && this.event_schema.timestamp.selected){
			selected_timestamp_as_date = new Date(this.event_schema.timestamp.selected);

			// TODO maybe do the timezone here
			time_picker.setDate(selected_timestamp_as_date);
			this.event_data.timestamp = this.event_schema.timestamp.selected;
		}

		this._time_picker = time_picker;
		return this;
	},

	whiteOrBlack: function(bgColorHex){
		var rgbColor = this.hexToRgb(bgColorHex);
		var r = rgbColor.r,
				g = rgbColor.g,
				b = rgbColor.b;
		var yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	},

	hexToRgb: function(hex){
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		    return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},

	bakeButtons: function(includeDelete){
		var markup = '<div class="buttons-container">';
			// Cancel
			markup += '<button class="cancel modal-close">Cancel</button>';
			// Save
			markup += '<input class="save" type="submit" value="Save"/>';
			markup += '<span class="submit-msg"></span>'
			// Delete (optional)
			if (includeDelete){
				markup += '<input class="destroy" type="button" value="Delete"/>';
			}
		// Close button container
		markup += '</div>';
		return markup;
	},

	// recordDropdownChange: function(e){
	// 	var $select = $(e.currentTarget),
	// 			key = $select.attr('name'),
	// 			val = $select.val();

	// 	this.event_data[key] = val;

	// 	// console.log(this.event_data);

	// 	return this;
	// },
	// recordInputChange: function(e){
	// 	var $input = $(e.currentTarget),
	// 			key = $input.attr('name'),
	// 			type = $input.attr('type'),
	// 			val,
	// 			action,
	// 			is_enabled; // Used for checkboxes

	// 	if (name == 'datepicker') {

	// 		val = +$input.attr('data-value'); // The datestamp is stored as an attribute of this input, not as the val of the input. Its val is just for display
	// 		action = 'set';

	// 	} else if (type == 'checkbox'){

	// 		is_enabled = ($input.prop('checked') == true);
	// 		if (is_enabled) {
	// 			action = 'push';
	// 		} else {
	// 			action = 'remove';
	// 		}

	// 		val = +$input.attr('data-value');

	// 		// console.log(val)

	// 	} else if (type == 'text'){

	// 		val = $input.val(); // This is normal
	// 		action = 'set';

	// 	} else if (type == 'number'){

	// 		val = parseInt($input.val()); // This is normal-ish
	// 		action = 'set';

	// 	} else {
	// 		console.error('Uncaught form field. Won\'t save record for ' + name, val)
	// 	}


	// 	// Now do
	// 	if (action == 'set') {
	// 		this.event_data[key] = val;
	// 	} else if (action == 'push'){
	// 		// Only push if it's not in there already
	// 		if (!_.contains(this.event_data[key], val)){
	// 			// console.log(this.event_data,key)
	// 			this.event_data[key].push(val);
	// 		}
	// 	} else if (action == 'remove'){
	// 		// Return a new copy of that array with the given value removed
	// 		this.event_data[key] = _.without(this.event_data[key], val);
	// 	}

	// 	// console.log(this.event_data);

	// 	return this;

	// },

	combineFormSchemaWithVals: function(schema_obj, settings_obj){
		var setting_schema = {};
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			if (!schema_obj[fieldName]) {
				console.log('MISSING fieldName:', fieldName, '. That has value:', setting)
				console.log('FOR SCHEMA OBJECT: ', schema_obj);
				console.log('WITH SETTINGS OBJECT: ', settings_obj);
			}

			var selected_array = schema_obj[fieldName].selected || [];
			// For now, this will create an array for impact_tags and article assignments
				setting_schema[fieldName] = schema_obj[fieldName];
			if (fieldName != 'tag_ids' && fieldName != 'content_items' && fieldName != 'set_event_content_items'){
				setting_schema[fieldName].selected = setting;
			} else {
				setting_schema[fieldName].selected = selected_array.concat(setting);
			}
		});

		return setting_schema;
	},

	validate: function(requiredKeys, formData, cb, ctx){
		console.log(requiredKeys)
		console.log(formData)

		var existing_keys = _.keys(formData),
				existing_vals = _.values(formData),
				msg,
				missing_keys = [], // We'll do a few tests and push the missing keys into here and then flatten
				s = '';
		// Test if we flat out missed some
		missing_keys.push(_.difference(requiredKeys, existing_keys));

		// Test if some are empty by testing for null and length. This will break on a number so do some type testing first
		_.each(formData, function(existingVal, existingKey){
			if (existingVal === undefined || existingVal === false || existingVal === ''){
				missing_keys = missing_keys.concat(existingKey);
			}
		});

		// Flatten this weird array structure we've made
		missing_keys = _.flatten(missing_keys);

		// And we're only interested in required ones
		missing_keys = _.intersection(requiredKeys, missing_keys);
		if (missing_keys.length > 0){
			if (missing_keys.length > 1){
				s = 's';
			}

			missing_keys = missing_keys.map(function(missingKey){ 
				return '"'+helpers.templates.toTitleCase(missingKey).replace(/_/g, ' ')+'"';
			}).join(', ');

			msg = 'You didn\'t include information for the required field'+s+': ' + missing_keys + '.'
			cb.call(ctx, 'Missing fields', msg);
		} else {
			cb.call(ctx, null, 'Saving!');
		}
	},

	printMsgOnSubmit: function(error, msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		
		this.$submitMsgText.removeClass('success').removeClass('fail');
		this.$submitMsgText.addClass(class_name).html(msg);
	},

	getSettings: function(setDefaultEvent){

		// Skip any that we've decided are skippable
		var $form_selector = this.$el.find('form :input[data-serialize-skip!="true"]').filter(function(){
			// Only take inputs that have values or have 0
			return $(this).val() || $(this).val() === 0;
		});

		// If we don't want to set default event options
		// Only include the non-default-evnt input fields in our serializer when creating the json
		if (!setDefaultEvent){
			$form_selector = $form_selector.filter(function(){
				return $(this).attr('data-is-default-event') == 'false';
			});
		}

		var form_options = $form_selector.serializeJSON();

		return form_options;

	},

	drag: d3.behavior.drag()
					.on('drag', function(d,i,e) {
						// FF has a bug where it will allow for drag when the mouse is selected text in an input field
						// This means that if you try to click and select text, it will move the window
						// Same thing for other browser on the scrollbar of the impact tags
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
});

