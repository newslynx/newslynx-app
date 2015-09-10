helpers.templates = {
	addCommas: helpers.common.addCommas,
	zeroIfNull: helpers.common.zeroIfNull,
	autolink: function(text){
		return Autolinker.link(text);
	},
	toLowerCase: function(str){
		return str.toLowerCase();
	},
	toTitleCase: helpers.common.toTitleCase,
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
	// toUserTimezone: helpers.common.toUserTimezone,
	prettyDateTimeFormat: 'MMM D, YYYY, h:mm a',
	// http://momentjs.com/docs/#/displaying/format/
	prettyDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MMM D, YYYY');

		return user_timezone_string; // returns `Jun 23, 2014`
	},
	prettyDatestamp: helpers.common.prettyDatestamp,
	conciseDate: helpers.common.conciseDate,
	fullIsoDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
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
		if (recipe.options && recipe.options.search_query){
			text += ',<br/>' + recipe.options.search_query;
		}
		return text;
	},
	htmlDecode: helpers.common.htmlDecode,
	boolToStr: helpers.common.boolToStr,
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
		var begins_with_http = /^http/;
		if (!begins_with_http.test(url)){
			url = 'http://'+url;
		}
		var domain = '';
		var match;
		if (url) {
			match = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
			if (match) {
				domain = match[0].replace('www.', '')
												.replace('://', '')
												.replace(/https?/, '')
												.replace('/', '')
			} else {
				console.log('WARNING: No URL match for', url, 'MATCH:', match)
				domain = ''
			}
		} else {
			console.log('WARNING: No URL', url)
			domain = ''
		}

		return domain;

	},
	handleEventCounts: function(lastRun, scheduleBy, eventCountsInfo, status, traceback){
		var msg = '';
		if (status == 'error'){
			msg = 'error (inspect element for info)<span class="error-report" style="display:none;">'+traceback+'</span>'
		} else if (status == 'uninitialized'){
			msg = 'uninitialized'
		} else if (eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled,' + eventCountsInfo.pending + ' pending';
		}else if (eventCountsInfo && scheduleBy){
			msg = eventCountsInfo.pending + ' pending';
		} else if (!lastRun && scheduleBy){
			msg = 'Scheduled to run, 0 pending';
		} else if (!eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled. 0 pending';
		} else if (!eventCountsInfo) {
			msg = '0 pending'
		}
		return msg;
	},
	articles: {
		prettyMetricName: function(name, superPretty){
			var super_pretty_names = {
				subject_tags: 'subj.',
				impact_tags: 'imp.'
			};
			// This is used in the comparison grid header when we want really short names
			if (superPretty && super_pretty_names[name]){
				name = super_pretty_names[name];
			}
			// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
			name = name.replace(/_/g, ' ').replace('ga ', 'GA ').replace('facebook', 'FB');
	    return name.charAt(0).toUpperCase() + name.slice(1);
		},
		isActiveMetric: function(metricName, sortKey){
			var sort_name = sortKey.replace('-metrics.','');
			var class_name = (sort_name == metricName) ? 'active' : '';
			return class_name;
		},
		htmlDecode: helpers.common.htmlDecode,
		prettyDatestamp: helpers.common.prettyDatestamp,
		conciseDate: helpers.common.conciseDate,
		prettyMetricValue: function(value, aggregationOperation){
			if (aggregationOperation == 'avg'){
				value = value.toFixed(2);
			} 
			return helpers.common.addCommas(value);
		},
		convertLineBreaksToHtml: function(str){
			str = str || '';
			return str.replace(/\n/g, '<br/>');
		},
		toTitleCase: helpers.common.toTitleCase,
		boolToStr: helpers.common.boolToStr
	}
}
