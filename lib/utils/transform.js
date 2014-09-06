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

function hydrateTagsInfo(dehydratedObjectList, info){
	dehydratedObjectList.forEach(function(dehydratedObject){
		var keys = ['impact_tags', 'subject_tags'];
		keys.forEach(function(key){
			// Add the full info on a `[key_name + '_full']` property
			// This will take take ids in `obj['impact_tags']` or `obj['subject_tags']` and map them to full objects on `key + '_full'
			dehydratedObject[key + '_full'] = dehydratedObject[key].map(function(id){ 
				return _.findWhere(info[key], {id: id});
			});
		});

		// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering based on our hyrdrated info above
		var impact_tag_categories = _.chain(dehydratedObject.impact_tags_full).pluck('category').uniq().value();
		var impact_tag_levels     = _.chain(dehydratedObject.impact_tags_full).pluck('level').uniq().value();
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