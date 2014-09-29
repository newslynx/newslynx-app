views.AA_BaseForm = Backbone.View.extend({

	events: {
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .article-assignee': 'removeArticleAssignee',
		'change select': 'recordDropdownChange',
		'change input': 'recordInputChange',
		'change textarea': 'recordInputChange'
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	assignmentTemplateFactory: _.template('<div class="article-assignee" data-value="<%= id %>"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span></div>'),

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

	postRender: function(disableTitleSearch, disablePikaday){
		if (!disableTitleSearch) { this.initArticleTitleSearcher(); }
		if (!disablePikaday) { this.initPikaday(); }

		return this;
	},

	bakeFormInputRow: function(fieldName, data){
		var type = data.type,
				field_name_pp = this.prettyName(fieldName),
				markup = '',
				has_help_link = (data.help && data.help.link),
				banished_fields = ['Requires approval']

		// TEMPORARY, we will later use all fields
		if (!_.contains(banished_fields, field_name_pp)){
			// Bake the general row container, the label and the input container
			markup = '<div class="form-row">';
				markup += '<div class="form-row-label-container '+((has_help_link) ? 'has-help-link' : '')+'">';
					markup += '<label for="'+fieldName+'"> '+field_name_pp+'</label> ';
				markup += '</div>';
				markup += '<div class="form-row-input-container">';
					if (has_help_link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">How do I search?</a></div>'; 
					// Get the appropriate markup
					markup += this.formJsonToMarkup[type].call(this, fieldName, data);
				markup += '</div>';
			markup += '</div>';
		}

		return markup;
	},

	formJsonToMarkup: {

		'article-search': function(fieldName, data){
			// Rename the field name
			fieldName = 'assignees-selector';
			var input_markup;

			// Give this a normal text input now, minus the data value, we'll instantiate the article searcher and load selecteds after it's been added to the DOM
			input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';

			return input_markup;
		},

		article_assignees: function(assignees){
			var markup = '';
			assignees.forEach(function(assignee){
				markup += this.assignmentTemplateFactory(assignee);
			},this);
			return markup;
		},

		timestamp: function(fieldName, data){
			var value,
					input_markup;

			// Give this a normal timestamp input now, we'll instantiate pikaday after it's been added to the DOM
			input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
			
			return input_markup;
		},

		text: function(fieldName, data){
			var value = this.escapeQuotes(data.selected) || '',
					input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
			
			return input_markup;
		},

		paragraph: function(fieldName, data){
			var value = this.escapeQuotes(data.selected) || '',
					input_markup = '<textarea type="text" name="'+fieldName+'" class="'+fieldName+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'">'+value+'</textarea>';
			
			return input_markup;
		},

		select: function(fieldName, data){
			var input_markup = '<select id="'+fieldName+'" name="'+fieldName+'">';
			_.each(data.options, function(option){
				var selected = '';
				if (data.selected == option) selected = 'selected';
				input_markup += '<option value="'+option+'" '+selected+'>'+this.prettyName(option)+'</option>';
			}, this);
			input_markup += '</select>';
			
			return input_markup;
		},

		checkbox: function(fieldName, data){
			var input_markup = '',
					namespacer = 'NewsLynx'; // To avoid id collisions

			_.each(data.options, function(checkboxItemObj){
				// var style = '';
				var style = this.styleCheckboxLabel(checkboxItemObj);
				var checkboxId = _.uniqueId(namespacer+'|'+fieldName + '|' + checkboxItemObj.id + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
				input_markup += '<div class="form-checkbox-group tags">';
					var checked = '';
					var selected_ids = _.pluck(data.selected, 'id')
					if (_.contains(selected_ids, checkboxItemObj.id)) checked = 'checked';
					input_markup += '<input class="tag" id="'+checkboxId+'" name="'+fieldName+'" data-value="'+checkboxItemObj.id+'" type="checkbox" ' + checked + '/>';
					input_markup += '<label class="tag" for="'+checkboxId+'" '+style+'>'+checkboxItemObj.name+'</label>';
				input_markup += '</div>';
			}, this);

			return input_markup;
		}

	},

	styleCheckboxLabel: function(checkboxItemObj){
		var bgColor = checkboxItemObj.color,
				color = this.whiteOrBlack(bgColor);

		return 'style="background-color:'+bgColor+';color:'+color+';"';
	},

	prettyName: function(name){
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
		var name_changes = {
			'q': 'search_query',
			'assignees': 'assignee(s)'
		};

		if (name_changes[name]) name = name_changes[name];
		name = name.replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
	},

	escapeQuotes: function(term){
		if (!term) { return false; }
		if (typeof term !== 'string') { return term };
		return term.replace(/"/g,'&quot;')
	},

	prettyTimestamp: function(utcDate){
		return new Date(utcDate*1000).toLocaleString();
	},

	initArticleTitleSearcher: function(){
		var $typeahead = this.$el.find('.assignees-selector'),
				that = this;

		this.$typeaheadRow = $typeahead.parents('.form-row');
		$('<div class="form-row article-assignees" ></div>').insertAfter(this.$typeaheadRow);

		$typeahead.typeahead({
			highlight: true
		},{
			name: 'articles',
			displayKey: 'title',
			source: app.bloodhound.ttAdapter()
		});

		$typeahead.on('typeahead:selected', function(e, d){
			e.preventDefault();
			// Clear this val on selection
			$(this).typeahead('val', '');
			// Add selection down below
			that.addArticleAssignee(d);
		});

		// Load the selecteds, if they exist
		if (_.isArray(this.event_schema.assignees.selected)){
			this.event_schema.assignees.selected.forEach(function(assignee){
				that.addArticleAssignee(assignee);
			});
		}

		return this;
	},

	addArticleAssignee: function(d){
		var $articleAssignments = this.$el.find('.form-row.article-assignees'),
				id = d.id;

		// Currently, selecting an article won't remove it from the typeahead options, so as a fix, don't add things if they already exist
		if (!_.contains(this.event_data.assignees, id)){
			// Add this to the assignees array
			this.event_data.assignees.push(id);
			// console.log(this.event_data)

			var markup = this.assignmentTemplateFactory(d);
			$articleAssignments.append(markup);
		}

		return this;
	},

	removeArticleAssignee: function(e){
		var $cntnr = $(e.currentTarget),
				val = +$cntnr.attr('data-value');
		// Remove from our list of stored values
		this.event_data.assignees = _.without(this.event_data.assignees, val);

		// Remove from DOM
		$(e.currentTarget).remove();
		return this;
	},

	initPikaday: function(){
		var time_picker,
				that = this,
				el = this.$el.find('input[name="timestamp"]')[0]; // Pikaday wants a pure dom object, not a jquery object

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

		if (this.event_schema && this.event_schema.timestamp && this.event_schema.timestamp.selected){
			time_picker.setDate(new Date(this.event_schema.timestamp.selected*1000));
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
			// Delete (optional)
			if (includeDelete){
				markup += '<input class="destroy" type="button" value="Delete"/>';
			}
		// Close button container
		markup += '</div>';
		return markup;
	},

	recordDropdownChange: function(e){
		var $select = $(e.currentTarget),
				key = $select.attr('name'),
				val = $select.val();

		this.event_data[key] = val;

		// console.log(this.event_data)

		return this;
	},
	recordInputChange: function(e){
		var $input = $(e.currentTarget),
				key = $input.attr('name'),
				type = $input.attr('type'),
				val,
				action,
				is_enabled; // Used for checkboxes

		if (name == 'timestamp') {

			val = +$input.attr('data-value'); // The timestamp if stored as an attribute of this input, not as the val of the input. Its val is just for display
			action = 'set';

		} else if (type == 'checkbox'){

			is_enabled = ($input.prop('checked') == true);
			if (is_enabled) {
				action = 'push';
			} else {
				action = 'remove';
			}

			val = +$input.attr('data-value');

		} else if (type == 'text'){

			val = $input.val(); // This is normal
			action = 'set';

		} else {
			console.error('Uncaught form field. Won\'t save record for ' + name, val)
		}


		// Now do
		if (action == 'set') {
			this.event_data[key] = val;
		} else if (action == 'push'){
			// Only push if it's not in there already
			if (!_.contains(this.event_data[key], val)){
				console.log(this.event_data,key)
				this.event_data[key].push(val);
			}
		} else if (action == 'remove'){
			// Return a new copy of that array with the given value removed
			this.event_data[key] = _.without(this.event_data[key], val);
		}

		console.log(this.event_data);

		return this;

	},

	combineFormSchemaWithVals: function(schema_obj, settings_obj){
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			if (!schema_obj[fieldName]) console.log(schema_obj,fieldName)
			var selected_array = schema_obj[fieldName].selected || [];
			// For now, this will create an array for impact_tags and article assignments
			if (fieldName != 'impact_tags' && fieldName != 'assignees'){
				schema_obj[fieldName].selected = setting;
			} else {
				schema_obj[fieldName].selected = selected_array.concat(setting);
			}
		});

		return schema_obj;
	}
});

