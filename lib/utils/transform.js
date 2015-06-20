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
	return _.isObject(found_object);
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

function nestSetEventSchemaAddImpactTags(sousChefsOrRecipes, impactTags){
	return sousChefsOrRecipes.map(function(obj){
		// Nest all of these keys prefaced by `set_event_` under the key `set_event_options`
		obj.set_event_options = {};
		_.each(obj.options, function(val, key){
			if (/^set_event_/.test(key)){
				if (key == 'set_event_tag_ids'){
					val.input_options = impactTags;
				}
				obj.set_event_options[key] = val;
				delete obj.options[key];
			}
		})
		return obj;
	});
}

function addEventFieldsOnAlertSchema(eventSchema, setEventSchema){
	// The `setEventSchema` has all of our fields but its keys are prefaced with `set_event_`. Do an extend but modify those key names
	_.each(setEventSchema, function(val, key){
		var sanitized_key = key.replace('set_event_', '');
		eventSchema[sanitized_key] = val;
	});

	return eventSchema;
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
	nestSetEventSchemaAddImpactTags: nestSetEventSchemaAddImpactTags,
	addEventFieldsOnAlertSchema: addEventFieldsOnAlertSchema,
	hydrateTagsInfo: hydrateTagsInfo,
	addTopLevelQuantMetrics: addTopLevelQuantMetrics,
	extend: _.extend,
	groupBy: _.groupBy,
	addColors: addColors,
	turnSettingsListToDict: turnSettingsListToDict,
	segregateTagTypes: segregateTagTypes,
	scaffoldDefaultSettings: scaffoldDefaultSettings,
	hasObject: hasObject
};