var _ = require('underscore');
var debug = require('tracer').console();

// TODO, possibly refactor this so that it gives the full object not just its name so that we can use the id as its identifier.
function populateDefaultEventWithTags(impactTags, eventSchema){
	var impact_tag_names = impactTags.map(function(tag) { return tag.name });
	eventSchema.impact_tags.options = impact_tag_names;
	return eventSchema;
}

function populateRecipeSchemasWithDefaultEvent(recipeSchemas, eventSchema){
	recipeSchemas.map(function(recipeSchema){
		return recipeSchema.default_event = eventSchema;
	});
	return recipeSchemas;
}

function populateEventCreatorSchemaWithDefaultEvent(alertInfoSchema, eventSchema){
	_.extend(alertInfoSchema, eventSchema);
	return alertInfoSchema;
}

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
			articleSummary[quantMetric.metric] = quantMetric.count;
		});
	})
	return articleSummaries;
}

// TEMP, these objects should be arrays to begin with
function objToArr(obj){
	return _.chain(obj).pairs().map(function(arr){ 
		var list_item = arr[1]
		list_item.name = arr[0];
		return list_item;
	}).value();
}

module.exports = {
	populateDefaultEventWithTags: populateDefaultEventWithTags,
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent,
	populateEventCreatorSchemaWithDefaultEvent: populateEventCreatorSchemaWithDefaultEvent,
	hydrateTagsInfo: hydrateTagsInfo,
	addTopLevelQuantMetrics: addTopLevelQuantMetrics,
	objToArr: objToArr
}