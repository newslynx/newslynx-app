var _ = require('underscore');
var chalk = require('chalk');
var debug = require('tracer').console();

function scaffoldDefaultSettings(orgSettingsList, keys){
	keys.forEach(function(key){
		var existing_setting = _.findWhere(orgSettingsList, {name: key}),
				default_setting = {name: key, value: undefined};
				
		if (!existing_setting){
			orgSettingsList.push(default_setting);
		}
	});

	return orgSettingsList;
}

function hasObject(list, props){
	var found_object = _.findWhere(list, props);
	return {
		is_authed: _.isObject(found_object),
		auth_info: found_object
	}
}

function turnSettingsListToDict(settingsList, defaults){
	var settings_dict = defaults || {};
	settingsList.forEach(function(settingObj){
		settings_dict[settingObj.name] = settingObj.value;
	});
	return settings_dict;
}

function segregateTagTypes(tagList){
	var subject_tags = [],
			impact_tags = [];

	tagList.forEach(function(tag){
		if (tag.type == 'subject'){
			subject_tags.push(tag);
		} else if (tag.type == 'impact'){
			impact_tags.push(tag);
		} else {
			console.error(chalk.red('Unknown tag of type ' + tag.type + ' detected.'));
		}
	});
	return {subject: subject_tags, impact: impact_tags};
}

function addImpactTags(sousChefsOrRecipes, impactTags){
	sousChefsOrRecipes.forEach(function(obj){
		obj.options.set_event_tag_ids.input_options = impactTags;
	});
	return sousChefsOrRecipes;
}

function addEventFieldsOnAlertSchema(eventSchema, setEventSchema){
	// The `setEventSchema` has all of our fields but its keys are prefaced with `set_event_`. Do an extend but modify those key names
	_.each(setEventSchema, function(val, key){
		var sanitized_key = key.replace('set_event_', '');
		eventSchema[sanitized_key] = val;
	});

	return eventSchema;
}


function hydrateTagsInfo(dehydratedObjectList, tags, tagKeys, attributeColorLookup){
	dehydratedObjectList.forEach(function(dehydratedObj){
		tagKeys.forEach(function(key){
			// Add the full info on a key name with `full` in the title
			// This will take take ids in `obj['impact']` or `obj['subject']` and map them like to
			// `subject_tag_ids` => `subject_tags_full`
			if (dehydratedObj[key]){
				var full_key = key.replace('_ids', 's_full'); 
				dehydratedObj[full_key] = dehydratedObj[key].map(function(id){ 
					var tag_key = key.replace('_tag_ids',''); // They're stored on our tags object just as `subject` and and `impact`
					return _.findWhere(tags[tag_key], {id: id});
				}).sort(function(a,b){
					return a.name.localeCompare(b.name);
				});
			}

			// Add `impact_tag_categories` and `impact_tag_levels` as their own items
			var impact_tag_categories = _.chain(dehydratedObj.impact_tags_full).pluck('category').uniq().map(function(nameText){
																														return {
																															name: nameText,
																															color: attributeColorLookup[nameText]
																														};
																													}).value();
			var impact_tag_levels     = _.chain(dehydratedObj.impact_tags_full).pluck('level').uniq().map(function(nameText){
																														return {
																															name: nameText,
																															color: attributeColorLookup[nameText]
																														};
																													}).value();

			dehydratedObj['impact_tag_categories'] = _.sortBy(impact_tag_categories, 'name');
			dehydratedObj['impact_tag_levels'] 		= _.sortBy(impact_tag_levels, 'name');

		});
	});

	return dehydratedObjectList;
}

// function addTopLevelQuantMetrics(articleSummaries){
// 	articleSummaries.forEach(function(articleSummary){
// 		// TEMPORARY, add zeros for quant level metrics that haven't been computed yet
// 		var quant_metrics = ['entrances','per_external','twitter','facebook','pageviews','total_time_on_page','avg_time_on_page','per_internal'];
// 		quant_metrics.forEach(function(qM){
// 			articleSummary[qM] = 0;
// 		});
// 		// Now add it more dynamically based on what's in quant metrics, this will also probably change
// 		articleSummary.quant_metrics.forEach(function(quantMetric){
// 			articleSummary[quantMetric.metric] = quantMetric.value;
// 		});
// 	});
// 	return articleSummaries;
// }

function addColors(list, colorLookup){
	return list.map(function(name){
		var color = colorLookup[name];
		return {name: name, color: color};
	});
}

function addApiSortNames(metricsList){
	// Add the string for how the api query params want metrics on a key called `sort_name`
	metricsList.forEach(function(metric){
		metric.sort_name = 'metrics.'+metric.name;
	});

	return metricsList;
}

function assembleDimensionsFromMetricsAndArticleAttrs(metricsWithSortNames, defaultDimensions){
	var defaultObjs = defaultDimensions.map(function(name){
		var pretty_name = name.charAt(0).toUpperCase() + name.slice(1, name.length);
		return {name: name, sort_name: name, display_name: pretty_name};
	});

	var dimensions = defaultObjs.concat(metricsWithSortNames);
	return dimensions;
}

function reformatDefaultSort(defaultSortBysStr){

	var sort_by,
			sort_ascending;

	if (/\./.test(defaultSortBysStr)){
		sort_by = defaultSortBysStr.split('.')[1];
	} else if (/^-/.test(defaultSortBysStr)){
		sort_by = defaultSortBysStr.replace('-','');
	} else {
		sort_by = defaultSortBysStr
	}

	if (/^-/.test(defaultSortBysStr)){
		sort_ascending = false;
	} else {
		sort_ascending = true;
	}

	return {sort_by: sort_by, sort_ascending: sort_ascending};

}

module.exports = {
	addImpactTags: addImpactTags,
	addEventFieldsOnAlertSchema: addEventFieldsOnAlertSchema,
	hydrateTagsInfo: hydrateTagsInfo,
	extend: _.extend,
	groupBy: _.groupBy,
	addColors: addColors,
	turnSettingsListToDict: turnSettingsListToDict,
	segregateTagTypes: segregateTagTypes,
	scaffoldDefaultSettings: scaffoldDefaultSettings,
	hasObject: hasObject,
	addApiSortNames: addApiSortNames,
	assembleDimensionsFromMetricsAndArticleAttrs: assembleDimensionsFromMetricsAndArticleAttrs,
	reformatDefaultSort: reformatDefaultSort
};