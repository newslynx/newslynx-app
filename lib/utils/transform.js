var _ = require('underscore');
var chalk = require('chalk');
var debug = require('tracer').console();
var io = require('indian-ocean')

var tag_attribute_colors

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
	return {
		is_authed: _.isObject(found_object),
		auth_info: found_object
	}
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

function addImpactTags(sousChefsOrRecipes, impactTags){
	sousChefsOrRecipes.forEach(function(obj){
		obj.options.set_event_tag_ids.input_options = impactTags;
	});
	return sousChefsOrRecipes;
}

function addEventFieldsOnAlertSchema(eventSchema, setEventSchema){
	// The `setEventSchema` has all of our fields but its keys are prefaced with `set_event_`. Do an extend but modify those key names
	_.each(setEventSchema, function(val, key){
		var sanitized_key = key.replace('set_event_', '');
		eventSchema[sanitized_key] = val;
	});

	return eventSchema;
}

function hydrateTagsInfo(dehydratedObjectList, tags, tagKeys, attributeColorLookup){
	dehydratedObjectList.forEach(function(dehydratedObj){
		tagKeys.forEach(function(key){
			// Add the full info on a key name with `full` in the title
			// This will take take ids in `obj['impact']` or `obj['subject']` and map them like to
			// `subject_tag_ids` => `subject_tags_full`
			if (dehydratedObj[key]){
				var full_key = key.replace('_ids', 's_full'); 
				dehydratedObj[full_key] = dehydratedObj[key].map(function(id){ 
					var tag_key = key.replace('_tag_ids',''); // They're stored on our tags object just as `subject` and and `impact`
					return _.findWhere(tags[tag_key], {id: id.toString()}); // Convert the id to a string since the ids are strings in our tag list since they set sent in the query strings
				}).sort(function(a,b){
					return a.name.localeCompare(b.name);
				});
			}

			// Add `impact_tag_categories` and `impact_tag_levels` as their own items
			var impact_tag_categories = _.chain(dehydratedObj.impact_tags_full).pluck('category').uniq().map(function(nameText){
																														return {
																															name: nameText,
																															color: attributeColorLookup[nameText]
																														};
																													}).value();
			var impact_tag_levels     = _.chain(dehydratedObj.impact_tags_full).pluck('level').uniq().map(function(nameText){
																														return {
																															name: nameText,
																															color: attributeColorLookup[nameText]
																														};
																													}).value();

			dehydratedObj['impact_tag_categories'] = _.sortBy(impact_tag_categories, 'name');
			dehydratedObj['impact_tag_levels'] 		= _.sortBy(impact_tag_levels, 'name');

		});
	});

	return dehydratedObjectList;
}

function addColors(list, colorLookup){
	return list.map(function(name){
		var color = colorLookup[name];
		return {name: name, color: color};
	});
}

function addApiSortNames(metricsList){
	// Add the string for how the api query params want metrics on a key called `sort_name`
	metricsList.forEach(function(metric){
		metric.sort_name = 'metrics.'+metric.name;
	});

	return metricsList;
}

function assembleDimensionsFromMetricsAndArticleAttrs(metricsWithSortNames, defaultDimensions){
	var defaultObjs = defaultDimensions.map(function(name){
		var pretty_name = name.charAt(0).toUpperCase() + name.slice(1, name.length).replace(/_/g, ' ');
		return {name: name, sort_name: name, display_name: pretty_name};
	});

	var dimensions = defaultObjs.concat(metricsWithSortNames);
	return dimensions;
}

function reformatDefaultSort(defaultSortBysStr){

	var sort_by,
			sort_ascending;

	if (/\./.test(defaultSortBysStr)){
		sort_by = defaultSortBysStr.split('.')[1];
	} else if (/^-/.test(defaultSortBysStr)){
		sort_by = defaultSortBysStr.replace('-','');
	} else {
		sort_by = defaultSortBysStr
	}

	if (/^-/.test(defaultSortBysStr)){
		sort_ascending = false;
	} else {
		sort_ascending = true;
	}

	return {sort_by: sort_by, sort_ascending: sort_ascending};

}

var exportHelpers = {

	flatteners: {

		singles: function(data, val){
			return data[val];
		}, 

		// Assumes it has `id` and `name`-ish key, which can be passed in as optional third arg
		objectLists: function(data, key, nameKey){
			nameKey = nameKey || 'name'
			return data[key].map(function(obj){
				return [obj.id, obj[nameKey]].join(this.secondary)
			}, this).join(this.primary);
		}, 

		metricsSingles: function(data, metricName){
			return data.metrics[metricName]
		},

		metricsLists: function(data, metricName){
			var metric_name_parts = metricName.split('|'), // This is a nested metric that we expanded. So we stored its parent name and then the facet name delimited by '|'
					metric_name = metric_name_parts[0],
					facet = metric_name_parts[1];

			return _.findWhere(data.metrics[metric_name], {facet: facet}).value
		}

	},

	articles: function(articlesAwaitAll, now, tags, cb) {

		if (!tag_attribute_colors) {
			io.readData('lib/public/data/tag-attribute-colors.json', proceed)
		} else {
			proceed(null, tag_attribute_colors)
		}

		function findKeys(obj, predicate){
			var list = [];
			_.each(obj, function(val, key){
				if (predicate(val, key)) {
					list.push(key)
				}
			})
			return list;
		}

		function expandListKeys(obj, predicate){
			var list = findKeys(obj, predicate)
			var expanded_list = [];
			list.forEach(function(keyName){
				obj[keyName].forEach(function(facetInfo){
					expanded_list.push(keyName+'|'+facetInfo.facet)
				})
			})
			return expanded_list;
		}

		function proceed(error, tagAttributeColors){
			if (error){
				console.log(error)
			}
			tag_attribute_colors = tagAttributeColors

			var delimiters = {
				primary: '|',
				secondary: ','
			};

			articlesAwaitAll(function(err, articlesList){
				if (err) {
					console.log(err)
				}
				// console.log(articlesList)
				var rows = articlesList.map(function(articleInfo){

					// Article info
					var article_column_data_types = {
						singles: ['id','created', 'title', 'description', 'domain', 'site_name', 'type', 'updated','url'],
						objectLists: ['authors','subject_tags_full', 'impact_tags_full'],
						metricsSingles: findKeys(articleInfo.metrics, function(val, key){ return !_.isArray(val); }),
						metricsLists: expandListKeys(articleInfo.metrics, function(val, key){ return _.isArray(val); })
					};

					// Take these column headers and add our data, flattening it as we go

					var row = {}
					row.exported_date = now // Add the time of when we exported this

					// Hydrate tags
					articleInfo = hydrateTagsInfo([articleInfo], tags, ['subject_tag_ids','impact_tag_ids'], tagAttributeColors)[0]; // Pass in a single element array and return the first element to preserve the ability to pass a list into the hydrate fn

					_.each(article_column_data_types, function(keyNames, groupType){
						keyNames.forEach(function(keyName){
							var cell_value = exportHelpers.flatteners[groupType].call(delimiters, articleInfo, keyName);
							row[keyName] = cell_value
						});
					});

					return row

				});

				cb(err, rows)

			});
		}
	},

	segregateById: function(itemList, uniqueIdsList) {
		// Turn a list of unique ids into a list of items with those ids
		var items_by_id = uniqueIdsList.map(function(id){
			var items_list = []
			itemList.forEach(function(item){
				var this_events_ids = _.pluck(item.content_items, 'id');
				if (_.contains(this_events_ids, +id) ) {
					items_list.push(item);
				}
			});
			return items_list;
		});
		return items_by_id;
	},

	timeseries: function(timeseriesAwaitAll, now, contentItemIds, cb) {
		timeseriesAwaitAll(function(err, timeseriesLists){
			var list_augmented = timeseriesLists.map(function(articleTimeseries, index){
				return articleTimeseries.map(exportHelpers.augmentRow('exported_date', now))
																						 .map(exportHelpers.augmentRow('content_item_id', contentItemIds[index]))
			})
			cb(err, list_augmented)
		})

	},

	events: function(eventAwaitAll, now, delimiters, uniqIdList, cb){

		eventAwaitAll(function(err, eventsInfos){
			// There is only one of these because we can make one call with multiple content item ids
			var all_events = _.chain(eventsInfos).pluck('events').flatten().value()
			var events_by_id = exportHelpers.segregateById(all_events, uniqIdList)
			var events_augmented = events_by_id.map(function(eventsForId, index){
				return flattenEvent(eventsForId, uniqIdList[index]).map(exportHelpers.augmentRow('exported_date', now));
			})
			cb(err, events_augmented);
		})

		function flattenEvent(events, contentItemId){

			events.forEach(function(evt){
				// Set the id for the article we're exporting
				evt.content_item_id = contentItemId
				// But also keep a list of all content item ids this event is associated with
				evt.content_item_ids = _.pluck(evt.content_items, 'id').join(delimiters.primary)
				delete evt.content_items
				delete evt.authors
				// if (_.isArray(evt.authors)) {
				// 	evt.authors = evt.authors.join(delimiters.primary)
				// }
				evt.tag_ids = evt.tag_ids.join(delimiters.primary)
				if (evt.meta.followers) {
					evt.followers = evt.meta.followers
				} else {
					evt.followers = null
				}
				evt.meta = JSON.stringify(evt.meta)
			});
			return events
		}
	},

	augmentRow: function(key, value){
		return function(objToAugment){
			var augmented_obj = {}
			augmented_obj[key] = value
			_.extend(augmented_obj, objToAugment);
			console.log(augmented_obj)
			return augmented_obj;
		}
	}

	// addExportedDate: function(timestamp){
	// 	return function(objToAugment){
	// 		var augmented_obj = {}
	// 		augmented_obj.exported_date = timestamp
	// 		_.extend(augmented_obj, objToAugment);
	// 		return augmented_obj;
	// 	}
	// },

	// addContentItemId: function(contentItemId){
	// 	return function(objToAugment){
	// 		var augmented_obj = {}
	// 		augmented_obj.content_item_id = contentItemId
	// 		_.extend(augmented_obj, objToAugment);
	// 		return augmented_obj;
	// 	}
	// }

}

module.exports = {
	addImpactTags: addImpactTags,
	addEventFieldsOnAlertSchema: addEventFieldsOnAlertSchema,
	hydrateTagsInfo: hydrateTagsInfo,
	extend: _.extend,
	groupBy: _.groupBy,
	flatten: _.flatten,
	addColors: addColors,
	turnSettingsListToDict: turnSettingsListToDict,
	segregateTagTypes: segregateTagTypes,
	scaffoldDefaultSettings: scaffoldDefaultSettings,
	hasObject: hasObject,
	addApiSortNames: addApiSortNames,
	assembleDimensionsFromMetricsAndArticleAttrs: assembleDimensionsFromMetricsAndArticleAttrs,
	reformatDefaultSort: reformatDefaultSort,
	exportHelpers: exportHelpers
};