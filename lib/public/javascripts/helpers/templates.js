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
			console.log(recipe)
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

		return user_timezone_string; // returns 
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
	displayRecipeParams: function(recipeId){
		var recipe = helpers.templates.getRecipeFromId(recipeId);
		var text = '';
		text += recipe.name
		if (recipe.options.search_query){
			text += ',<br/>' + recipe.options.search_query;
		}
		return text;
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

	},
	handleEventCounts: function(lastRun, scheduleBy, eventCountsInfo){
		var msg = '';
		if (eventCountsInfo && scheduleBy){
			msg = eventCountsInfo.pending + ' pending';
		} else if (eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled,' + eventCountsInfo.pending + ' pending';
		} else if (!lastRun && scheduleBy){
			msg = 'Scheduled to run, 0 pending';
		} else if (!eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled. 0 pending';
		}
		return msg;
	}
}
