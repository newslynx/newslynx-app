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

function hydrateTagsInfo(dehydratedObjectList, info){
	dehydratedObjectList.forEach(function(dehydratedObject){
		var keys = ['impact_tags', 'subject_tags'];
		keys.forEach(function(key){
			// Add the full info on a `[key_name + '_full']` property
			dehydratedObject[key + '_full'] = dehydratedObject[key].map(function(id){ return info[key].filter(function(objectWithIds){ return objectWithIds.id === id; })[0] });
		});
		// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering
		// TODO, I could add underscore and simplify this with `_.pluck` and `_.uniq`
		var impact_tag_categories = [],
				impact_tag_levels = [];
		info.impact_tags.forEach(function(impact_tag){
			// Only add if it already exists
			if (impact_tag_categories.indexOf(impact_tag.category) == -1) { impact_tag_categories.push(impact_tag.category) }
			if (impact_tag_levels.indexOf(impact_tag.level) == -1) { impact_tag_levels.push(impact_tag.level) }
		})
		dehydratedObject['impact_tag_categories'] = impact_tag_categories;
		dehydratedObject['impact_tag_levels'] 		= impact_tag_levels;
	})
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

module.exports = {
	populateDefaultEventWithTags: populateDefaultEventWithTags,
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent,
	populateEventCreatorSchemaWithDefaultEvent: populateEventCreatorSchemaWithDefaultEvent,
	hydrateTagsInfo: hydrateTagsInfo,
	addTopLevelQuantMetrics: addTopLevelQuantMetrics
}