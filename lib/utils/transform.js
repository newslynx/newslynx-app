var _ = require('underscore');
var debug = require('tracer').console();

// TODO, possibly refactor this so that it gives the full object not just its name so that we can use the id as its identifier.
// function populateDefaultEventWithTags(impactTags, eventSchema){
// 	var impact_tag_names = impactTags.map(function(tag) { return tag.name });
// 	eventSchema.impact_tags.options = impact_tag_names;
// 	return eventSchema;
// }

function populateRecipeSchemasWithDefaultEvent(recipeSchemas, eventSchema){
	return recipeSchemas.map(function(recipeSchema){
		recipeSchema.default_event = eventSchema;
		return recipeSchema
	});
}

// function populateEventCreatorSchemaWithDefaultEvent(alertInfoSchema, eventSchema){
// 	_.extend(alertInfoSchema, eventSchema);
// 	return alertInfoSchema;
// }

function hydrateTagsInfo(dehydratedObjectList, info, tagKeys){
	dehydratedObjectList.forEach(function(dehydratedObject){
		tagKeys.forEach(function(key){
			// Add the full info on a `[key_name + '_full']` property
			// This will take take ids in `obj['impact_tags']` or `obj['subject_tags']` and map them to full objects on `key + '_full'
			if (dehydratedObject[key]){
				dehydratedObject[key + '_full'] = dehydratedObject[key].map(function(id){ 
					return _.findWhere(info[key], {id: id});
				});
			}
		});

		// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering based on our hydrated info above
		// But only if we've hydrated based on impact tag, which we don't always do because articles don't have impact tags, only subject tags
		if (dehydratedObject.impact_tags_full){
			var impact_tag_categories = _.chain(dehydratedObject.impact_tags_full).pluck('category').uniq().value();
			var impact_tag_levels     = _.chain(dehydratedObject.impact_tags_full).pluck('level').uniq().value();
			dehydratedObject['impact_tag_categories'] = impact_tag_categories;
			dehydratedObject['impact_tag_levels'] 		= impact_tag_levels;
		}
	});
	return dehydratedObjectList;
}

function addTopLevelQuantMetrics(articleSummaries){
	articleSummaries.forEach(function(articleSummary){
		articleSummary.quant_metrics.forEach(function(quantMetric){
			articleSummary[quantMetric.metric] = quantMetric.value;
		});
	});
	return articleSummaries;
}

// function copyJson(json){
// 	return JSON.parse(JSON.stringify(json));
// }

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
	addColors: addColors
	// populateDefaultEventWithTags: populateDefaultEventWithTags,
	// populateEventCreatorSchemaWithDefaultEvent: populateEventCreatorSchemaWithDefaultEvent,
	// copyJson: copyJson,
	// objToArr: objToArr//,
	// imbueListOptionsWithAccountData: imbueListOptionsWithAccountData
}