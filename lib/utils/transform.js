var debug = require('tracer').console();

function populateDefaultEventWithTags(impactTags, eventSchema){
	var impact_tag_names = impactTags.map(function(tag) { return tag.name });
	eventSchema.impact_tags.options = impact_tag_names;
	return eventSchema;
}

function populateRecipeSchemasWithDefaultEvent(recipeSchemas, eventSchema){
	recipeSchemas.map(function(recipeSchema){
		// Also add a key that says to set this to false
		recipeSchema.set_default_event = false;
		return recipeSchema.default_event = eventSchema;
	});
	return recipeSchemas;
}

module.exports = {
	populateDefaultEventWithTags: populateDefaultEventWithTags,
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent
}