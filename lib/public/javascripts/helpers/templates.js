helpers.templates = {
	addCommas: function(x){
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},
	toLowerCase: function(str){
		return str.toLowerCase();
	},
	toTitleCase: function(str){
		return (str.charAt(0).toUpperCase() + str.slice(1, str.length));
	},
	serviceFromSource: function(src){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the first node.
		return src.split('-')[0];
	},
	methodFromSource: function(src){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the second node.
		return this.prettyName(src.split('-')[1]);
	},
	prettyPrintSource: function(src){
		src = src.replace(/-/g, ' ').replace(/_/g, ' ');
		return helpers.templates.toTitleCase(src);
	},
	toUserTimezone: function(utcDate){
		utcDate = utcDate*1000
		var utc_date = new Date(utcDate),
				user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.orgInfo.timezone) ));
		
		return user_timezone_date;
	},
	prettyDate: function(utcDate){
		var user_timezone_date = helpers.templates.toUserTimezone(utcDate),
				dot = '.'

		var full_date_string = user_timezone_date.toDateString(),
				month_day_year_arr = full_date_string.split(' ').slice(1,4); // Remove day of the week
		if (month_day_year_arr[0] == 'May') dot = '';
		var commafy = month_day_year_arr[0] + dot + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
		return commafy.replace(' 0', ' '); // Strip leading zeros, returns `Jun 23, 2014`
	},
	prettyTimestamp: function(utcDate){
		return new Date(utcDate*1000).toLocaleString();
	},
	conciseDate: function(utcDate){
		var user_timezone_date = helpers.templates.toUserTimezone(utcDate);
		var full_date_string = user_timezone_date.toISOString(), 
				month_day_year_arr = full_date_string.split('T')[0], // Remove the time, strip leading zeros
				parts_arr = month_day_year_arr.split('-');
		return parts_arr[1] + '-' + parts_arr[2] + '-' + parts_arr[0].substr(2,2) // returns `6-24-14`
	},
	formatEnabled: function(bool){
		if (bool) return 'Recipe is active';
		return 'Recipe not active';
	},
	formatDefaultEventEnabled: function(bool){
		if (bool) return 'Enabled';
		return 'Disabled';
	},
	getAssociatedItems: function(id, itemKey, itemsObj){
		itemsObj = pageData[itemsObj];
		return _.filter(itemsObj, function(obj) { return obj[itemKey] == id });
	},
	// countAssociatedItems: function(id, itemKey, itemsObj){
	// 	var count = this.getAssociatedItems(id, itemKey, itemsObj).length;
	// 	// if (count == 0) count = 'None';
	// 	return count;
	// },
	bakeEventCreationForm: function(recipe_id, text, link, timestamp){
		var that = this,
				markup = '',
				schema = {},
				schema_with_selects = {};
		// Get the schema for the source so you can modify the options below
		$.extend(true, schema, pageData.eventSchema);

		var settings = {
			timestamp: timestamp,
			text: text,
			link: link 
		}
		$.extend(true, settings, _.findWhere(pageData.accountRecipes, {id: recipe_id}).default_event);
		// This doesn't need to be returned bc javascript will modify the original object but it makes it more semantic
		// Add the data that currently exists in the data model to the schema
		schema_with_selects = this.combineFormSchemaWithVals(schema, settings); 
		// It's always a schema file that gets baked, not a settings file.
		markup = this.bakeForm(schema_with_selects);
		return markup;
	},
	bakeRecipeUpdateForm: function(id, source, settings, recipeName, schemaOrDefaultEvent){
		var that = this,
				markup = '',
				schema = {},
				schema_with_selects = {};
		// Get the schema for the source so you can modify the options below
		$.extend(true, schema, _.findWhere(pageData.recipeSchemas, {source: source})[schemaOrDefaultEvent]);
				// $.extend(true, schema, _.filter(pageData.recipeSchemas, function(recipeSchema){ return recipeSchema.source == source })[0][schemaOrDefaultEvent]);
		// This doesn't need to be returned bc javascript will modify the original object but it makes it more semantic
		// Add the data that currently exists in the data model to the schema
		schema_with_selects = this.combineFormSchemaWithVals(schema, settings, recipeName);
		// It's always a schema file that gets baked, not a settings file.
		markup = this.bakeForm(schema_with_selects);
		return markup;
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
	formJsonToMarkup: {
		text: function(fieldName, fieldNamePretty, data){
			var value = this.escapeQuotes(data.selected) || '',
					markup,
					label = '';
			markup = '<div class="form-row">';
				markup += '<div class="form-row-label-container">';
					markup += '<label for="'+fieldName+'"> '+fieldNamePretty+'</label> ';
				markup += '</div>';
				markup += '<div class="form-row-input-container">';
					if (data.help && data.help.link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">How do I search?</a></div>'; 
					if (fieldName == 'assignees') { fieldName = 'assignees-selector'; }
					else if (fieldName == 'timestamp') label = '<div class="labelled" aria-label="'+this.prettyTimestamp(value)+'"></div>';
					markup += label+'<input type="text" name="'+fieldName+'" class="'+fieldName+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
				markup += '</div>';
			markup += '</div>';
			return markup;
		},
		select: function(fieldName, fieldNamePretty, data){
			var markup,
					that = this;
			markup = '<div class="form-row">';
				markup += '<div class="form-row-label-container">';
					markup += '<label>'+fieldNamePretty + '</label> ';
				markup += '</div>';
				markup += '<div class="form-row-input-container">';
					markup += '<select id="'+fieldName+'" name="'+fieldName+'">';
					_.each(data.options, function(option){
						var selected = '';
						if (data.selected == option) selected = 'selected';
						markup += '<option value="'+option+'" '+selected+'>'+that.prettyName(option)+'</option>';
					});
					markup += '</select>';
				markup += '</div>';
			markup += '</div>';
			return markup;
		},
		checkbox: function(fieldName, fieldNamePretty, data){
			var markup;
			// For now we're not including this as an option.
			var banished_keys = ['Requires approval'];
			if (!_.contains(banished_keys, fieldNamePretty)){
				markup = '<div class="form-row">';
					markup += '<div class="form-row-label-container form-row-label-top">';
						markup += '<label>'+fieldNamePretty + '</label> ';
					markup += '</div>';
					markup += '<div class="form-row-input-container">';
					_.each(data.options, function(checkboxItem){
						var checkboxId = _.uniqueId('NewsLynx|checkbox|'+fieldName + '|' + checkboxItem + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
						markup += '<div class="form-checkbox-group">'
							var checked;
							if (_.contains(data.selected, checkboxItem)) checked = 'checked';
							markup += '<input id="'+checkboxId+'" name="'+fieldName + '|' + checkboxItem+'" type="checkbox" ' + checked + '/>';
							markup += '<label for="'+checkboxId+'">'+checkboxItem+'</label>';
						markup += '</div>'
						// markup += '<input name="'+checkboxItem+'" type="checkbox" ' + ((data.selected) ? 'checked' : '' ) + ' />';
					});
					markup += '</div>';
				markup += '</div>';
				return markup;
			} else {
				return '';
			}
		}
	},
	bakeForm: function(schema){
		var form = '';
		_.each(schema, function(fieldData, fieldName){
			var field_name_pretty = this.prettyName(fieldName);
			form += this.formJsonToMarkup[fieldData.type].call(this, fieldName, field_name_pretty, fieldData);
		}, this);
		return form;
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
	displaySearchParams: function(source, settings){
		// Each source has a different key for how it searches for things
		if (source == 'google-alert') return settings.search_query;
		else if (source == 'twitter-search') return settings.q;
		else if (source == 'twitter-list') return settings.owner_screen_name + ',' + settings.slug;
		else if (source == 'twitter-user') return settings.screen_name;
		else if (source == 'reddit-search') return settings.search_query;
		else if (source == 'facebook-page') return settings.page_id;
		else console.error('You need to add a search_query key `templates.js` to display this type of recipe.')
	},
	getRecipeFromId: function(id){
		return pageData.accountRecipes.filter(function(recipe) { return +recipe.id === id; })[0]
	},
	htmlDecode: function(input){
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes[0].nodeValue;
	},
	boolToStr: function(bool, str){
		var response;
		if (bool){
			response = str;
		} else {
			response = '';
		}
		return response;
	}
}
