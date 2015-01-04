helpers.templates = {
	addCommas: function(x){
		if (x || x === 0){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			console.log('Warning: Expected string, found', x);
			return '0';
		}
	},
	autolink: function(text){
		return Autolinker.link(text);
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
	// TEMPORARY until service is added on the object
	serviceFromAlertId: function(id){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the first node.
		var underscore_arr = id.split('-')[0].split('_'),
				service = underscore_arr.pop();

		return service;
	},
	methodFromSource: function(src){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the second node.
		return this.prettyName(src.split('-')[1]);
	},
	prettyPrintSource: function(src){
		src = src.replace(/-/g, ' ').replace(/_/g, ' ');
		return helpers.templates.toTitleCase(src);
	},
	toUserTimezone: function(utcTimestamp){
		utcTimestamp = utcTimestamp*1000;
		var utc_moment = moment(utcTimestamp),
				user_timezone_moment = utc_moment.tz(pageData.timezone);
		
		return user_timezone_moment;
	},
	// http://momentjs.com/docs/#/displaying/format/
	prettyDate: function(utcTimestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp),
				user_timezone_string = user_timezone_moment.format('MMM D, YYYY');

		return user_timezone_string; // returns `Jun 23, 2014`
	},
	prettyTimestamp: function(utcTimestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp),
				user_timezone_string = user_timezone_moment.format('M/D/YYYY, h:mm a');

		return user_timezone_string; // returns `9/6/2014, 9:13 am`

	},
	conciseDate: function(utcTimestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp),
				user_timezone_string = user_timezone_moment.format('MM-DD-YY');

		return user_timezone_string; // returns `6-24-14`
	},
	fullIsoDate: function(utcTimestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcTimestamp),
				user_timezone_string = user_timezone_moment.format();

		return user_timezone_string; // returns `6-24-14`
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
	combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName){
		// The name isn't stored in the settings object anymore so add that separately, but only if it has a name field
		if (schema_obj.name) schema_obj.name.selected = recipeName;
		// For each key in settings, go and add that value under the `selected` key in the schema file
		// This value will then trigger in the markup baking that that value should be selected
		_.each(settings_obj, function(setting, fieldName){
			if (!schema_obj[fieldName]) { console.log(schema_obj, fieldName); }
			var selected_array = schema_obj[fieldName].selected || []
			// For now, this will create an array for impact_tags and article assignments
			if (fieldName != 'impact_tags' && fieldName != 'assignees'){
				schema_obj[fieldName].selected = setting;
			} else {
				schema_obj[fieldName].selected = selected_array.concat(setting);
			}
		});

		return schema_obj;
	},
	prettyName: function(name){
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
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
		else if (source == 'twitter-list') return settings.slug + ',' + settings.filter;
		else if (source == 'twitter-user') return settings.screen_name + ',' + settings.filter;
		else if (source == 'reddit-search') return settings.search_query;
		else if (source == 'facebook-page') return settings.page_id + ',' + settings.filter;
		else console.log('You need to add a search_query key `templates.js` to display this type of recipe.')
	},
	getRecipeFromId: function(id){
		return _.findWhere(pageData.accountRecipes, {id: id})
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
	},
	getHeadlineFromArticleId: function(Id){
		var article = _.findWhere(pageData.articleSkeletons, {id: Id}),
				title;
		if (article) {
			title = article.title;
		} else {
			title = 'Article headline no longer available';
		}
		return title;
	}
}
