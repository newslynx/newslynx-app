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
	dehydratedObjectList.forEach(function(dehygradedObject){
		var keys = ['impact_tags', 'subject_tags'];
		keys.forEach(function(key){
			// Add the full info on a `[key_name + '_full']` property
			dehygradedObject[key + '_full'] = dehygradedObject[key].map(function(id){ return info[key].filter(function(objectWithIds){ return objectWithIds.id === id; })[0] });
		});
		// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering
		var impact_tag_categories = [],
				impact_tag_levels = [];
		info.impact_tags.forEach(function(impact_tag){
			if (impact_tag_categories.indexOf(impact_tag.category) == -1) { impact_tag_categories.push(impact_tag.category) }
			if (impact_tag_levels.indexOf(impact_tag.level) == -1) { impact_tag_levels.push(impact_tag.level) }
		})
		dehygradedObject['impact_tag_categories'] = impact_tag_categories;
		dehygradedObject['impact_tag_levels'] 		= impact_tag_levels;
	})
	return dehydratedObjectList;
}

module.exports = {
	populateDefaultEventWithTags: populateDefaultEventWithTags,
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent,
	populateEventCreatorSchemaWithDefaultEvent: populateEventCreatorSchemaWithDefaultEvent,
	hydrateTagsInfo: hydrateTagsInfo
}