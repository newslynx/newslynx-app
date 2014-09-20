views.AA_BaseForm = Backbone.View.extend({

	events: {
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .article-assignee': 'removeArticleAssignee'
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	assignmentTemplateFactory: _.template('<div class="article-assignee"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input value="<%= id %>" name="assignees"></div>'),

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

	postRender: function(){
		this.initPikaday();
		this.initArticleTitleSearcher();

		return this;
	},

	combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName){
		// The name isn't stored in the settings object anymore so add that separately, but only if it has a name field
		if (schema_obj.name) schema_obj.name.selected = recipeName;
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			// if (!schema_obj[fieldName]) 
			var selected_array = schema_obj[fieldName].selected || []
			// For now, this will create an array for impact_tags, TODO, handle assignments to articles
			if (fieldName != 'impact_tags' && fieldName != 'assignees'){
				schema_obj[fieldName].selected = setting;
			} else {
				schema_obj[fieldName].selected = selected_array.concat(setting);
			}
		});

		return schema_obj;
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
			var input_markup,
					selecteds = data.selected;

			// Clear the selected since we'll be adding that as children below the input, not the input itself
			// We've stored it above for reference
			data.selected = null;

			// Give this a normal text input now, we'll instantiate the article searcher after it's been added to the DOM
			input_markup = this.formJsonToMarkup.text.call(this, fieldName, data);
			input_markup += this.formJsonToMarkup.article_assignees.call(this, selecteds);

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
					input_markup = '';

			if (data.selected){
				value = this.escapeQuotes(data.selected) || '';
				input_markup += '<div class="labelled" aria-label="'+this.prettyTimestamp(value)+'"></div>';
			}
			
			// Give this a normal timestamp input now, we'll instantiate pikaday after it's been added to the DOM
			input_markup += this.formJsonToMarkup.text.call(this, fieldName, data);

			return input_markup;
		},
		text: function(fieldName, data){
			var value = this.escapeQuotes(data.selected) || '';

			var input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
			return input_markup;
		},
		paragraph: function(fieldName, data){
			var value = this.escapeQuotes(data.selected) || '',
					input_markup = '<textarea type="text" name="'+fieldName+'" class="'+fieldName+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"></textarea>';
			return input_markup;
		},
		select: function(fieldName, data){
			var input_markup = '<select id="'+fieldName+'" name="'+fieldName+'">';
			_.each(data.options, function(option){
				var selected = '';
				if (data.selected == option) selected = 'selected';
				input_markup += '<option value="'+option+'" '+selected+'>'+this.prettyName(option)+'</option>';
			});
			input_markup += '</select>';
			return input_markup;
		},
		checkbox: function(fieldName, data){
			var input_markup = '';
			_.each(data.options, function(checkboxItemObj){
				// var style = '';
				var style = this.styleCheckboxLabel(checkboxItemObj);
				var checkboxId = _.uniqueId('NewsLynx|checkbox|'+fieldName + '|' + checkboxItemObj.name + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
				input_markup += '<div class="form-checkbox-group tags">'
					var checked;
					if (_.contains(data.selected, checkboxItemObj.name)) checked = 'checked';
					input_markup += '<input class="tag" id="'+checkboxId+'" name="'+fieldName + '|' + checkboxItemObj.name+'" type="checkbox" ' + checked + '/>';
					input_markup += '<label class="tag" for="'+checkboxId+'" '+style+'>'+checkboxItemObj.name+'</label>';
				input_markup += '</div>'
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
		}
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

		return this;
	},

	addArticleAssignee: function(d){
		var $articleAssignments = this.$el.find('.form-row.article-assignees');
		var markup = this.assignmentTemplateFactory(d);
		$articleAssignments.append(markup);

		return this;
	},

	removeArticleAssignee: function(e){
		$(e.currentTarget).remove();

		return this;
	},

	initPikaday: function(){
		var time_picker,
				el = this.$el.find('input[name="timestamp"]')[0]; // Pikaday wants a pure dom object, not a jquery object

		time_picker = new Pikaday({
			field: el,
			clearInvalidInput: true,
			onSelect: function(){
				var this_date = this.getDate(),
						timestamp = this_date.getTime();
				// On change, save the timestamp to the data
				// var timestamp_list_object = _.findWhere(form_data, {name: 'timestamp'});
				// timestamp_list_object.selected = timestamp/1000;
			},
			onClear: function(){
				// Clear the timestamp on error or non-date value
				// var timestamp_list_object = _.findWhere(form_data, {name: 'timestamp'});
				// timestamp_list_object.selected = null;
			}
		});

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
	}

});

