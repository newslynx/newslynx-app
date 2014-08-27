var debug = require('tracer').console();

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

module.exports = {
	populateDefaultEventWithTags: populateDefaultEventWithTags,
	populateRecipeSchemasWithDefaultEvent: populateRecipeSchemasWithDefaultEvent,
	populateEventCreatorSchemaWithDefaultEvent: populateEventCreatorSchemaWithDefaultEvent
}