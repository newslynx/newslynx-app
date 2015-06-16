helpers.templates = {
	addCommas: function(x){
		if (x || x === 0){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			console.log('Warning: Expected string, found', x);
			return '';
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
	serviceFromSousChef: function(sousChef){
		// TODO, For now this works but will need to be changed if we have services that are more than one word
		// Ideally the icon should be stored as base64 on the sous_chef
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the first node.
		return sousChef.split('-')[0];
	},
	methodFromSousChef: function(sousChef){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the second node.
		// TODO, For now this works but will need to be changed if we have services that are more than one word
		// Ideally the icon should be stored as base64 on the sous_chef
		return this.prettyName(sousChef.split('-')[1]);
	},
	alertSourceIdToSousChef: function(sourceId){
		// "facebook-page-to-event-promotion:14947c7a-11fe-11e5-aebc-c82a14194035"
		return sourceId.split(':')[0];
	},
	alertSourceIdToService: function(sourceId){
		var sous_chef = helpers.templates.alertSourceIdToSousChef(sourceId);
		return helpers.templates.serviceFromSousChef(sous_chef);
	},
	getRecipeFromId: function(recipe_id){

		// For manual alert creation
		// Those alerts will have a `recipe_id` of null, change that to `-1`, which is the id of our manual recipe
		// This isn't done in the database due to foreign key constraints
		// per issue #395 https://github.com/newslynx/issue-tracker/issues/395
		if (recipe_id === null){
			recipe_id = -1;
		}
		var recipe = collections.recipes.instance.findWhere({id: recipe_id});
		var recipe_json;

		if (recipe){
			recipe_json = recipe.toJSON();
		} else {
			console.log('ERROR, could not find recipe of id', recipe_id, 'in',  collections.recipes.instance.models)
			console.log(recipe_json)
		}

		return recipe_json;
	},
	prettyPrintSource: function(src){
		src = src.replace(/-/g, ' ').replace(/_/g, ' ');
		return helpers.templates.toTitleCase(src);
	},
	toUserTimezone: function(utcDatestamp){
		var utc_moment = moment(utcDatestamp),
				user_timezone_moment = utc_moment.tz(pageData.timezone);
		
		return user_timezone_moment;
	},
	// http://momentjs.com/docs/#/displaying/format/
	prettyDate: function(utcDatestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MMM D, YYYY');

		return user_timezone_string; // returns `Jun 23, 2014`
	},
	prettyDatestamp: function(utcDatestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('M/D/YYYY, h:mm a');

		return user_timezone_string; // returns `9/6/2014, 9:13 am`

	},
	conciseDate: function(utcDatestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MM-DD-YY');

		return user_timezone_string; // returns `6-24-14`
	},
	fullIsoDate: function(utcDatestamp){
		var user_timezone_moment = helpers.templates.toUserTimezone(utcDatestamp),
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
	// combineFormSchemaWithVals: function(schema_obj, settings_obj, recipeName){
	// 	// The name isn't stored in the settings object anymore so add that separately, but only if it has a name field
	// 	if (schema_obj.name) schema_obj.name.selected = recipeName;
	// 	// For each key in settings, go and add that value under the `selected` key in the schema file
	// 	// This value will then trigger in the markup baking that that value should be selected
	// 	_.each(settings_obj, function(setting, fieldName){
	// 		if (!schema_obj[fieldName]) { console.log(schema_obj, fieldName); }
	// 		var selected_array = schema_obj[fieldName].selected || []
	// 		// For now, this will create an array for impact_tags and article assignments
	// 		if (fieldName != 'impact_tags' && fieldName != 'assignees'){
	// 			schema_obj[fieldName].selected = setting;
	// 		} else {
	// 			schema_obj[fieldName].selected = selected_array.concat(setting);
	// 		}
	// 	});

	// 	return schema_obj;
	// },
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
	displaySearchParams: function(sousChef, settings){
		// `settings` can also be a recipe id if coming from an alert
		if (!_.isObject(settings)){
			settings = helpers.templates.getRecipeFromId(settings).options;
		}
		// TODO, this should key should be designated as a value on the sousChef

		// Each sousChef has a different key for how it searches for things
		if (sousChef == 'google-alert') { return settings.search_query; }
		else if (sousChef == 'twitter-search') { return settings.q; }
		else if (sousChef == 'twitter-list') { return settings.slug + ',' + settings.filter; }
		else if (sousChef == 'twitter-user') { return settings.screen_name + ',' + settings.filter; }
		else if (sousChef == 'reddit-search') { return settings.search_query; }
		else if (sousChef == 'facebook-page') { return settings.page_id + ',' + settings.filter; }
		else {
			console.log('You need to add a search_query key in `templates.js` to display the search term for sous chef:', sousChef);
			return 'TODO';
		}
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
	},
	extractDomain: function(url){
		var domain = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[0]
										.replace('www.', '')
										.replace('://', '')
										.replace(/https?/, '')
										.replace('/', '')

		return domain;

	}
}
