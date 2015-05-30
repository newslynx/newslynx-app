var _ = require('underscore');
var chalk = require('chalk');
var debug = require('tracer').console();

function turnUserDictTolist(userDict, keys){
	var user_list = [];
	_.chain(userDict).pick(keys).each(function(value, key){
		var obj = {
			id: userDict.id
		};
		obj[key] = value;
		user_list.push(obj);
		console.log(user_list)
	}).value();

	return user_list;
}

function scaffoldDefaultSettings(orgSettingsList, keys){
	keys.forEach(function(key){
		var existing_setting = _.findWhere(orgSettingsList, {name: key}),
				default_setting = {name: key, value: null};
				
		if (!existing_setting){
			orgSettingsList.push(default_setting);
		}
	});

	return orgSettingsList;
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

function populateRecipeSchemasWithDefaultEvent(recipeSchemas, eventSchema){
	return recipeSchemas.map(function(recipeSchema){
		recipeSchema.default_event = eventSchema;
		return recipeSchema
	});
}


function hydrateTagsInfo(dehydratedObjectList, info, tagKeys){
	dehydratedObjectList.forEach(function(dehydratedObject){
		tagKeys.forEach(function(key){
			// Add the full info on a `[key_name + '_full']` property
			// This will take take ids in `obj['impact_tags']` or `obj['subject_tags']` and map them to full objects on `key + '_full'
			if (dehydratedObject[key]){
				dehydratedObject[key + '_full'] = dehydratedObject[key].map(function(id){ 
					return _.findWhere(info[key], {id: id});
				}).sort(function(a,b){
					return a.name.localeCompare(b.name);
				});
			}
		});

		// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering based on our hydrated info above
		// But only if we've hydrated based on impact tag, which we don't always do because articles don't have impact tags, only subject tags
		if (dehydratedObject.impact_tags_full){
			var impact_tag_categories = _.chain(dehydratedObject.impact_tags_full).pluck('category').uniq().value();
			var impact_tag_levels     = _.chain(dehydratedObject.impact_tags_full).pluck('level').uniq().value();
			dehydratedObject['impact_tag_categories'] = impact_tag_categories.sort();
			dehydratedObject['impact_tag_levels'] 		= impact_tag_levels.sort();
		}
	});
	return dehydratedObjectList;
}

function addTopLevelQuantMetrics(articleSummaries){
	articleSummaries.forEach(function(articleSummary){
		// TEMPORARY, add zeros for quant level metrics that haven't been computed yet
		var quant_metrics = ['entrances','per_external','twitter','facebook','pageviews','total_time_on_page','avg_time_on_page','per_internal'];
		quant_metrics.forEach(function(qM){
			articleSummary[qM] = 0;
		});
		// Now add it more dynamically based on what's in quant metrics, this will also probably change
		articleSummary.quant_metrics.forEach(function(quantMetric){
			articleSummary[quantMetric.metric] = quantMetric.value;
		});
	});
	return articleSummaries;
}


function addColors(list, colorLookup){
	return list.map(function(attribute){
		attribute.color = colorLookup[attribute.name];
		return attribute;
	});
}

module.exports = {
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent,
	hydrateTagsInfo: hydrateTagsInfo,
	addTopLevelQuantMetrics: addTopLevelQuantMetrics,
	extend: _.extend,
	groupBy: _.groupBy,
	addColors: addColors,
	turnSettingsListToDict: turnSettingsListToDict,
	segregateTagTypes: segregateTagTypes,
	turnUserDictTolist: turnUserDictTolist,
	scaffoldDefaultSettings: scaffoldDefaultSettings
};