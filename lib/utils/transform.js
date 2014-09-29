var _ = require('underscore');
var debug = require('tracer').console();

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
	addColors: addColors
}