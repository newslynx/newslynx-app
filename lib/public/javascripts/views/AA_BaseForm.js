views.AA_BaseForm = Backbone.View.extend({

	events: {
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .article-assignee': 'removeArticleAssignee'
	},

	killPropagation: function(e){
		e.stopPropagation();
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	// keyBeenPressed: function(e){
	// 	var return_key_code = 13;

	// 	console.log(e.keyCode)

	// 	if (e.keyCode == return_key_code){
	// 		e.stopPropagation();
	// 		e.preventDefault();
	// 	}
	// },

	// assignmentTemplateFactory: _.template('<div class="article-assignee""><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\'/></div>'),

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

	refresh: function(enabled){
		this.render();
		this.postRender(enabled);
	},

	postRender: function(enabled){

		if (enabled.search) { this.initArticleTitleSearcher(); }
		if (enabled.pikaday) { this.initPikaday(); }
		this.$submitMsgText = this.$el.find('.submit-msg');

		var el_modal_outer = this.$el.find('.modal-outer')[0];

		d3.select(el_modal_outer).call(this.drag);

		return this;
	},

	// Override this in parent views
	removeSetEventPrefix: _.identity,

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
						console.log('ERROR: Your specified `input_type` of ', type, 'on the object', data, 'is missing a corresponding function in `formJsonToMarkup`');
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

			var required = data.required ? 'required' : '';

			// Give this a normal text input now, minus the data value, we'll instantiate the article searcher and load selecteds after it's been added to the DOM
			var input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" '+required+' placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" data-is-default-event="'+isDefaultEvent+'" data-serialize-skip="true"/>';

			return input_markup;
		},

		content_items: function(assignees){
			var markup = '';
			assignees.forEach(function(assignee){
				markup += this.assignmentTemplateFactory(assignee);
			}, this);
			return markup;
		},

		set_event_content_items: function(assignees){
			return this.formJsonToMarkup.content_items.call(this, assignees);
		},

		datepicker: function(fieldName, data, isDefaultEvent){
			var class_name = this.removeSetEventPrefix(fieldName);

			var required = data.required ? 'required' : '';

			// Give this a normal timestamp input, we'll instantiate pikaday after it's been added to the DOM
			// This first input is for the pikaday select and display
			var input_markup = '<input type="text" data-type="datepicker" class="'+class_name+'" '+required+' placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" autocomplete="off" data-is-default-event="'+isDefaultEvent+'" data-serialize-skip="true"/>';
			// Make an input sibling that will be what we read the data from
			input_markup += '<input type="hidden" name="'+fieldName+'" data-type="datepicker-value" class="'+class_name+'" data-is-default-event="'+isDefaultEvent+'"/>';
			
			return input_markup;
		},

		textNumberOrHidden: function(fieldName, data, which, isDefaultEvent){
			// TODO, investigate why value needs to be double escaped for Brian's version of Chrome.
			var value = this.escapeQuotes(data.selected),
					class_name = this.removeSetEventPrefix(fieldName);

			var required = data.required ? 'required' : '';

			var input_markup = '<input type="'+which+'" name="'+fieldName+':auto" class="'+class_name+'" value="'+this.escapeQuotes(value)+'" '+required+' placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" '+((which == 'number') ? 'min="0"' : '') +' data-is-default-event="'+isDefaultEvent+'"/>';
			
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

			var required = data.required ? 'required' : '';

			var input_markup = '<select class="'+class_name+'" name="'+fieldName+':auto" data-is-default-event="'+isDefaultEvent+'" '+required+'>';

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
			'img_url': 'Image URL',
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

	initArticleTitleSearcher: function(){
		var $typeahead = this.$el.find('.assignees-selector'),
				content_items = _.findWhere(this.full_schema, {input_type: 'search'}), // Get the element in our schema that is of `search` `input_type`
				that = this;

		this.$typeaheadRow = $typeahead.parents('.form-row');
		$('<div class="form-row article-assignees" ></div>').insertAfter(this.$typeaheadRow);

		$typeahead.typeahead({
			highlight: true,
			minLength: 3
		},{
			name: 'content-items',
			displayKey: 'title',
			async: true,
			source: function(query, syncResults, asyncResults){
				var query_url = '/api/_VERSION/content?q='+query+'&search=title&fields=id,title';
				$.ajax({
					url: query_url,
					dataType: 'json',
					success: function(results){
						asyncResults(results.content_items);
					}
				});
			}
		});

		$typeahead.on('typeahead:selected', function(e, d){
			e.preventDefault();
			// Clear this val on selection
			$(this).typeahead('val', '');
			// Add selection down below
			that.addArticleAssignee(d, content_items.selected);
		});

		// Load the selecteds, if they exist
		if (_.isArray(content_items.selected)){
			content_items.selected.forEach(function(contentItem){
				that.addArticleAssignee(contentItem, content_items.selected);
			});
		}

		return this;
	},

	addArticleAssignee: function(d, existingContentItems){
		var $articleAssignments,
				id,
				form_data,
				markup;

		if (d){
			$articleAssignments = this.$el.find('.form-row.article-assignees');
			id = d.id;

			var form_data = this.getSettings(true); // `true` means get the default event values also

			// Currently, selecting an article won't remove it from the typeahead options, so as a fix, don't add things if they already exist
			if (!_.contains(_.pluck(existingContentItems, 'id'), id)){

				markup = this.assignmentTemplateFactory(d);
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
				$el = this.$el.find('input[data-type="datepicker"]'),  // This convention of using `data-type` breaks from our current convention of using names. But those names follow data key fields. In this case, `created`, is a bit too specific. This gives us flexibility in making text fields Pikaday instances without them being tied to a specific datakey. see `formJsonToMarkup.datepicker` for where this is set.
				el = $el[0], // Pikaday wants a pure dom object, not a jquery object
				$form_el = $el.siblings('input[data-type="datepicker-value"]'); // We create a sibling value that stores the properly formatted date string so we can use the $el input for a prettier display;

		time_picker = new Pikaday({
			field: el,
			showTime: true,
			use24hour: true,
			timezone: pageData.timezone,
			// clearInvalidInput: true,
			onOpen: function(){
				console.log('existing',this.toString())
			},
			onSelect: function(){
				var moment_timezone_date = this.getMoment(),
						full_date_string = moment_timezone_date.format(),
						pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

				$form_el.val(full_date_string);
				$el.val(pretty_date_string);

				console.log('form_el',full_date_string)
				console.log('el',pretty_date_string)
			}
			// ,
			// onClear: function(){
			// 	// // Clear the timestamp on error or non-date value
			// 	// that.form_data.timestamp = null;
			// }
		});

		var date_obj_in_schema = _.findWhere(this.full_schema, {input_type: 'datepicker'}),
				selected_date;

		if (date_obj_in_schema){
			console.log('initia', date_obj_in_schema.selected)
			selected_date = moment(date_obj_in_schema.selected)
			console.log('initial in timezone',selected_date.format())
			time_picker.setMoment(selected_date);
		}

		// var selected_timestamp_as_date;
		// if (this.form_data && this.form_data.created && this.event_schema.timestamp.selected){
		// 	selected_timestamp_as_date = new Date(this.event_schema.timestamp.selected);

		// 	// TODO maybe do the timezone here
		// 	time_picker.setDate(selected_timestamp_as_date);
		// 	this.event_data.timestamp = this.event_schema.timestamp.selected;
		// }

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

	combineFormSchemaWithVals: function(schema_obj, settings_obj){
		var setting_schema = {};
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			if (!schema_obj[fieldName]) {
				console.log('Your key name', fieldName, 'in your settings object of ', settings_obj)
				console.log('Needs a corresponding schema structure in' , schema_obj);
			}

			var selected_array = schema_obj[fieldName].selected || [];
			setting_schema[fieldName] = schema_obj[fieldName];

			// This will create an array for impact_tags and article assignments
			var array_fields = ['tag_ids', 'set_event_tag_ids', 'content_items', 'set_event_content_items'];
			if (!_.contains(array_fields, fieldName)){
				setting_schema[fieldName].selected = setting;
			} else {
				setting_schema[fieldName].selected = selected_array.concat(setting);
			}
		});

		return setting_schema;
	},

	validate: function(requiredKeys, formData, cb, ctx){

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
				return !$(this).attr('data-is-default-event') || $(this).attr('data-is-default-event') == 'false';
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

