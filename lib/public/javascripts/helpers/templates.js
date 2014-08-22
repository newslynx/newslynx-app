helpers.templates = {
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
	prettyPrintSource: function(src){
		src = src.replace(/-/g, ' ');
		return helpers.templates.toTitleCase(src);
	},
	toUserTimezone: function(utcDate){
		var utc_date = new Date(utcDate),
				user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.org.timezone) ));
		
		return user_timezone_date;
	},
	date: function(utcDate){
		var user_timezone_date = helpers.templates.toUserTimezone(utcDate);
		// TODO, Figure out proper timezone stuff
		var full_date_string = user_timezone_date.toDateString(),
				month_day_year_arr = full_date_string.split(' ').slice(1,4), // Remove day of the week
				commafy = month_day_year_arr[0] + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
		return commafy.replace(' 0', ' '); // Strip leading zeros, returns `Jun 23, 2014`
	},
	conciseDate: function(utcDate){
		var user_timezone_date = helpers.templates.toUserTimezone(utcDate);
		var full_date_string = user_timezone_date.toISOString(), 
				month_day_year_arr = full_date_string.split('T')[0]//.replace(/-0/g, '-'), // Remove the time, strip leading zeros
				parts_arr = month_day_year_arr.split('-');
		return parts_arr[1] + '-' + parts_arr[2] + '-' + parts_arr[0].substr(2,2) // returns `6-24-14`
	},
	formatEnabled: function(bool){
		if (bool) return 'Recipe is active';
		return 'Recipe not active';
	},
	getAssociatedItems: function(uid, itemKey, itemsObj){
		itemsObj = pageData[itemsObj];
		return _.filter(itemsObj, function(obj) { return obj[itemKey] == uid });
	},
	countAssociatedItems: function(uid, itemKey, itemsObj){
		var count = this.getAssociatedItems(uid, itemKey, itemsObj).length;
		// if (count == 0) count = 'None';
		return count;
	},
	bakeRecipeUpdateForm: function(uid, source, settings){
		var that = this,
				markup = '',
				schema = {},
				schema_with_selects = {};
		// Get the schema for the source so you can modify the options below
		$.extend(true, schema, _.filter(pageData.recipeSchemas, function(recipeSchema){ return recipeSchema.source == source })[0].schema);
			console.log('source',source)
			console.log('settings',settings)
			// console.log(schema)
		// This doesn't need to be returned bc javascript will modify the origin object but it makes it more semantic
		// Add the data that currently exists in the data model to the schema
		schema_with_selects = this.combineFormSchemaWithVals(schema, settings);
		// It's always a schema file that gets baked, not a settings file.
		markup = this.bakeForm(source, schema_with_selects);
		return markup;
	},
	combineFormSchemaWithVals: function(schema_obj, settings_obj){
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			schema_obj[fieldName].selected = setting;
		});
		return schema_obj;
	},
	formJsonToMarkup: {
		text: function(source, prettyName, data){
			var name_id = _.uniqueId(source),
					value = this.escapeQuotes(data.selected) || '',
					markup;
			markup = '<div class="form-row">';
				markup += '<label for="'+name_id+'"> '+prettyName+'</label> ';
				markup += '<div class="input-text-container">';
					if (data.help && data.help.link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">How do I search?</a></div>'; 
					markup += '<input type="text" name="'+name_id+'" id="'+name_id+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
				markup += '</div>';
			markup += '</div>';
			return markup;
		},
		select: function(source, prettyName, data){
			var name_id = _.uniqueId(source),
					markup;
			markup = '<div class="form-row">';
			markup += '<label>'+prettyName + '</label> ';
			markup += '<select id="'+name_id+'">';
			_.each(data.options, function(option){
				var selected = '';
				if (data.selected == option) selected = 'selected';
				markup += '<option value="'+option+'" '+selected+'>'+option+'</option>';
			});
			markup += '</select>';
			markup += '</div>';
			return markup;
		},
		checkbox: function(source, prettyName, data){
			var name_id = _.uniqueId(source),
					markup;
			markup = '<div class="form-row">';
			markup += '<label>'+prettyName + '</label> ';
			markup += '<input type="checkbox" ' + ((data.selected) ? 'checked' : '' ) + ' />';
			return markup;
		}
	},
	bakeForm: function(source, schema){
		// console.log(schema)
		var form = '';
		_.each(schema, function(fieldData, fieldName){
			var pretty_name = this.prettyName(fieldName);
			form += this.formJsonToMarkup[fieldData.type].call(this, source, pretty_name, fieldData);
		}, this);
		return form;
	},
	prettyName: function(name){
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
		var name_changes = {
			'q': 'search_query'
		}
		if (name_changes[name]) name = name_changes[name];
		name = name.replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
	},
	escapeQuotes: function(term){
		if (!term) return false;
		return term.replace(/"/g,'&quot;')
	}
}
