'use strict';
var helpers = {};
var templates = {};
var models = {};
var collections = {};
var app = {};
var views = {};
var routing = {};
helpers.common = {
	sortNumber: function(a,b) {
		return a - b;
	},
	htmlDecode: function(input){
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes[0].nodeValue;
	},
	toUserTimezone: function(utcDatestamp){
		var utc_moment = moment(utcDatestamp),
				user_timezone_moment = utc_moment.tz(pageData.timezone);
		
		return user_timezone_moment;
	},
	conciseDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MM-DD-YY');

		return user_timezone_string; // returns `6-24-14`
	},
	addCommas: function(x){
		if (x || x === 0){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			console.log('Warning: Expected string, found', x);
			return '';
		}
	},
	zeroIfNull: function(x) {
		console.log(x)
		if (!x) {
			return 0
		} else {
			return x
		}
	},
	prettyDatestamp: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('M/D/YYYY, h:mm a');

		return user_timezone_string; // returns `9/6/2014, 9:13 am`
	},
	toTitleCase: function(str){
		return (str.charAt(0).toUpperCase() + str.slice(1, str.length));
	},
	boolToStr: function(bool, str){
		var response;
		if (bool){
			response = str;
		} else {
			response = '';
		}
		return response;
	}
}

helpers.modelsAndCollections = {

	toggle: function(key){
		this.set(key, !this.get(key));
	},
	

	setBoolByIds: function(trueKey, idKey, ids, bool){
		ids = ids.split('+').map(function(id){ return +id });
		ids.forEach(function(id){
			var where_obj = {}; where_obj[idKey] = id;
			if (this.where(where_obj).length) this.where(where_obj)[0].set(trueKey, bool);
		}, this);
	},

	addTagsFromId: function(objectList){
		objectList.forEach(function(item){
			item.subject_tags = $.extend(true, [], item.subject_tags.map(function(d) {return pageData.org['subject_tags'].filter(function(f){ return f.id == d })[0] }) );
			item.events.forEach(function(ev){
				// console.log(pageData.org['impact_tags'])
				ev.impact_tags = $.extend(true, [], ev.impact_tags.map(function(d) {return pageData.org['impact_tags'].filter(function(f){ return f.id == d })[0] }) );
			})
		});
		return objectList;
	},

	metadata: function(prop, value) { 
		if (!this.metadataHash){
			this.metadataHash = {};
		}
		if (value === undefined) {
			return this.metadataHash[prop];
		} else {
			this.metadataHash[prop] = value;
		}

	}

}
helpers.templates = {
	addCommas: helpers.common.addCommas,
	zeroIfNull: helpers.common.zeroIfNull,
	autolink: function(text){
		return Autolinker.link(text);
	},
	toLowerCase: function(str){
		return str.toLowerCase();
	},
	toTitleCase: helpers.common.toTitleCase,
	serviceFromSousChef: function(sousChef){
		// TODO, For now this works but will need to be changed if we have services that are more than one word
		// Ideally the icon should be stored as base64 on the sous_chef
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the first node.
		return sousChef.split('-')[0];
	},
	serviceFromRecipeSlug: function(recipeSlug){
		var sous_chef = collections.recipes.instance.findWhere({slug: recipeSlug})
		return sous_chef.get('sous_chef').split('-')[0]
	},
	methodFromSousChef: function(sousChef){
		// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the second node.
		// TODO, For now this works but will need to be changed if we have services that are more than one word
		// Ideally the icon should be stored as base64 on the sous_chef
		return this.prettyName(sousChef.split('-')[1]);
	},
	alertSourceIdToRecipeSlug: function(sourceId){
		// "facebook-page-to-event-promotion:14947c7a-11fe-11e5-aebc-c82a14194035"
		return sourceId.split(':')[0];
	},
	alertSourceIdToService: function(sourceId){
		var recipe_slug = helpers.templates.alertSourceIdToRecipeSlug(sourceId);
		return helpers.templates.serviceFromRecipeSlug(recipe_slug);
	},
	getRecipeFromId: function(recipe_id){
		// For manual alert creation
		// Those alerts will have a `recipe_id` of null, change that to `-1`, which is the id of our manual recipe
		// This isn't done in the database due to foreign key constraints
		// per issue #395 https://github.com/newslynx/issue-tracker/issues/395
		if (recipe_id === null){
			recipe_id = -1;
		}
		var recipe = collections.recipes.instance.findWhere({id: recipe_id});
		var recipe_json;

		if (recipe){
			recipe_json = recipe.toJSON();
		} else {
			console.log('ERROR, could not find recipe of id', recipe_id, 'in',  collections.recipes.instance.models)
			console.log(recipe)
		}

		return recipe_json;
	},
	prettyPrintSource: function(src){
		src = src.replace(/-/g, ' ').replace(/_/g, ' ');
		return helpers.templates.toTitleCase(src);
	},
	// toUserTimezone: helpers.common.toUserTimezone,
	prettyDateTimeFormat: 'MMM D, YYYY, h:mm a',
	// http://momentjs.com/docs/#/displaying/format/
	prettyDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MMM D, YYYY');

		return user_timezone_string; // returns `Jun 23, 2014`
	},
	prettyDatestamp: helpers.common.prettyDatestamp,
	conciseDate: helpers.common.conciseDate,
	fullIsoDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format();

		return user_timezone_string; // returns 
	},
	formatEnabled: function(bool){
		if (bool) return 'Recipe is active';
		return 'Recipe not active';
	},
	formatDefaultEventEnabled: function(bool){
		if (bool) return 'Enabled';
		return 'Disabled';
	},
	getAssociatedItems: function(id, itemKey, itemsObj){
		itemsObj = pageData[itemsObj];
		return _.filter(itemsObj, function(obj) { return obj[itemKey] == id });
	},
	prettyName: function(name){
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
		name = name.replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
	},
	escapeQuotes: function(term){
		if (!term) { return false; }
		if (typeof term !== 'string') { return term };
		return term.replace(/"/g,'&quot;')
	},
	displayRecipeParams: function(recipeId){
		var recipe = helpers.templates.getRecipeFromId(recipeId);
		var text = '';
		text += recipe.name
		if (recipe.options && recipe.options.search_query){
			text += ',<br/>' + recipe.options.search_query;
		}
		return text;
	},
	htmlDecode: helpers.common.htmlDecode,
	boolToStr: helpers.common.boolToStr,
	extractDomain: function(url){
		var begins_with_http = /^http/;
		if (!begins_with_http.test(url)){
			url = 'http://'+url;
		}
		var domain = '';
		var match;
		if (url) {
			match = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
			if (match) {
				domain = match[0].replace('www.', '')
												.replace('://', '')
												.replace(/https?/, '')
												.replace('/', '')
			} else {
				console.log('WARNING: No URL match for', url, 'MATCH:', match)
				domain = ''
			}
		} else {
			console.log('WARNING: No URL', url)
			domain = ''
		}

		return domain;

	},
	handleEventCounts: function(lastRun, scheduleBy, eventCountsInfo, status, traceback){
		var msg = '';
		var pending_count 
		if (_.isObject(eventCountsInfo)) {
			pending_count = helpers.templates.addCommas(eventCountsInfo.pending) || 0
		}
		
		if (status == 'error'){
			msg = 'error (inspect element for info)<span class="error-report" style="display:none;">'+traceback+'</span>'
		} else if (status == 'uninitialized'){
			msg = 'uninitialized'
		} else if (eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled,' + pending_count + ' pending';
		} else if (eventCountsInfo && scheduleBy){
			msg = pending_count + ' pending';
		} else if (!lastRun && scheduleBy){
			msg = 'Scheduled to run, 0 pending';
		} else if (!eventCountsInfo && scheduleBy == 'unscheduled'){
			msg = 'Not scheduled. 0 pending';
		} else if (!eventCountsInfo) {
			msg = '0 pending'
		}
		return msg;
	},
	articles: {
		prettyMetricName: function(name, superPretty){
			var super_pretty_names = {
				subject_tags: 'subj.',
				impact_tags: 'imp.'
			};
			// This is used in the comparison grid header when we want really short names
			if (superPretty && super_pretty_names[name]){
				name = super_pretty_names[name];
			}
			// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
			name = name.replace(/_/g, ' ').replace('ga ', 'GA ').replace('facebook', 'FB');
	    return name.charAt(0).toUpperCase() + name.slice(1);
		},
		isActiveMetric: function(metricName, sortKey){
			var sort_name = sortKey.replace('-metrics.','');
			var class_name = (sort_name == metricName) ? 'active' : '';
			return class_name;
		},
		htmlDecode: helpers.common.htmlDecode,
		prettyDatestamp: helpers.common.prettyDatestamp,
		conciseDate: helpers.common.conciseDate,
		prettyMetricValue: function(value, aggregationOperation){
			if (aggregationOperation == 'avg'){
				value = value.toFixed(2);
			} 
			return helpers.common.addCommas(value);
		},
		convertLineBreaksToHtml: function(str){
			str = str || '';
			return str.replace(/\n/g, '<br/>');
		},
		toTitleCase: helpers.common.toTitleCase,
		boolToStr: helpers.common.boolToStr
	}
}

models.aa_base_article = {
  "Model": Backbone.Model.extend({
    toggle: helpers.modelsAndCollections.toggle,

    urlRoot:'/api/_VERSION/content',

    parse: function(articleSummaryJson){
      var articles_with_data = this.addInfo(articleSummaryJson);
      return articles_with_data;
    },

    // What orchestrates everything to get some the messiness out of `parse`
    addInfo: function(articleSummaryJson){
      articleSummaryJson = this.hydrateTagsInfo(articleSummaryJson, pageData.tags, ['subject_tag_ids', 'impact_tag_ids']);
      articleSummaryJson = this.nestTags(articleSummaryJson);
      articleSummaryJson = this.addTagInputOptions(articleSummaryJson);
      return articleSummaryJson;
    },

    addTagInputOptions: function(articleJson){
      // // Add a url so we can add/remove these 
      // // These models don't exist in a collection so that's why we use urlRoot
      var subject_tag_models = collections.subject_tags.instance.models.map(function(tagModel){
        var tag_model = tagModel.clone();
        tag_model.urlRoot = 'api/_VERSION/content/'+articleJson.id+'/tags/';
        return tag_model;
      });
      articleJson.subject_tag_input_options = subject_tag_models;
      return articleJson;
    },

    // For general display
    hydrateTagsInfo: function(dehydratedObj, tags, tagKeys){
      tagKeys.forEach(function(key){
        // Add the full info on a key name with `full` in the title
        // This will take take ids in `obj['impact']` or `obj['subject']` and map them like to
        // `subject_tag_ids` => `subject_tags_full`
        if (dehydratedObj[key]){
          var full_key = key.replace('_ids', 's_full'); 
          dehydratedObj[full_key] = dehydratedObj[key].map(function(id){ 
            var tag_key = key.replace('_tag_ids',''); // They're stored on our tags object just as `subject` and and `impact`
            return _.findWhere(tags[tag_key], {id: id});
          }).sort(function(a,b){
            return a.name.localeCompare(b.name);
          });
        }

        // Add `impact_tag_categories` and `impact_tag_levels` as their own items
        var impact_tag_categories = _.chain(dehydratedObj.impact_tags_full)
                                                            .pluck('category')
                                                            .uniq()
                                                            .map(function(nameText){
                                                              var attr = {};
                                                              attr.name = nameText;
                                                              attr.color = pageData.attributeColorLookup[nameText];
                                                              return attr;
                                                            })
                                                            .value();

        var impact_tag_levels     = _.chain(dehydratedObj.impact_tags_full)
                                                            .pluck('level')
                                                            .uniq()
                                                            .map(function(nameText){
                                                              var attr = {};
                                                              attr.name = nameText;
                                                              attr.color = pageData.attributeColorLookup[nameText];
                                                              return attr;
                                                            })
                                                            .value();

        dehydratedObj['impact_tag_categories'] = _.sortBy(impact_tag_categories, 'name');
        dehydratedObj['impact_tag_levels']    = _.sortBy(impact_tag_levels, 'name');

      });
      return dehydratedObj;
    },

    // For display in article comparison row
    nestTags: function(unnestedObj){

      // For subject tags, chunk them into groups of three so they will be displayed as columns of no more than three. Each one looks like this and they're stored under `subject_tags_full`.
        /*
        {
          "articles": 2,
          "domain": "propalpatine.org",
          "name": "Fracking",
          "color": "#6a3d9a",
          "id": 5,
          "events": 2
        }
        */
        // `tag_columns` will be a list of lists, each containing no more than three tags
        var subject_tag_columns = [],
            chunk = 3;

        if (unnestedObj.subject_tags_full){
          for (var i = 0; i < unnestedObj.subject_tags_full.length; i += chunk) {
            subject_tag_columns.push( unnestedObj.subject_tags_full.slice(i,i+chunk) );
          }
        }

        // This on the object, which will either be an empty array or one with our groups
        unnestedObj.subject_tags_grouped = subject_tag_columns;

        var impact_tag_columns = [];

        if (unnestedObj.impact_tags_full){

          // Impact tags need more nesting. It makes most sense to group them by category
          // These tags look like this and they're found under `impact_tags_full`.
          /*
          {
            "category": "change",
            "articles": 2,
            "domain": "propalpatine.org",
            "name": "legislative impact",
            "level": "Institution",
            "color": "#fb8072",
            "events": 2, 
            "id": 1
          }
          */
          impact_tag_columns = d3.nest()
            .key(function(d) { return d.category; })
            .key(function(d) { return d.name; })
            .rollup(function(list) { 
              return {
                name: list[0].name,
                color: list[0].color,
                category: list[0].category,
                level: list[0].level,
                count: list.length
              }
            })
            .entries(unnestedObj.impact_tags_full);
        }

        unnestedObj.impact_tags_grouped = impact_tag_columns;

      return unnestedObj;
    },

    

  })
}
// This model gets a urlRoot when it's used to create an event from an alert
models.alert = {
	"Model": Backbone.Model.extend({
		urlRoot: 'api/_VERSION/events'
	})
}
models.article_detailed = {
	"Model": models.aa_base_article.Model.extend({

		getGaMetrics: function(){
      var ga_metrics = {};
      
      _.each(this.get('metrics'), function(val, key){
        if (/^ga_/.test(key)) {
          ga_metrics[key] = val;
        }
      });
      
      return ga_metrics;
    }

	})
}
models.article_summary = {
	"Model": models.aa_base_article.Model.extend({
		defaults: {
			active_selected: false,
			selected_for_compare: false,
			selected_for_detail: false
		},
    url: 'api/_VERSION/content'
	})
}
models.filters = {
	"Model": Backbone.Model.extend({
		metadata: helpers.modelsAndCollections.metadata,
		initialize: function(){
			this.on('filter', this.checkChanged);
			this.assembleQueryParams();

			return this;
		},
		checkChanged: function(){
			var previous = this.metadata('previousParams'),
					current = JSON.stringify(this.assembleQueryParams(true));

			if (previous != current){
				this.trigger('hasChanged');
			}

			return this;
		},
		assembleQueryParams: function(silent){
			var model_json = $.extend(true, {}, this.toJSON()); 
			_.each(model_json, function(val, key){
				if (_.isArray(val)){
					model_json[key] = val.join(',');
				}
			});
			if (model_json.sort_by){
				model_json.sort = model_json.sort_by;

				delete model_json.sort_by;
			}
			if (!silent){
				this.metadata('previousParams', JSON.stringify(model_json));
			}
			return model_json;
		}
	})
}
models.event = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/_VERSION/events',

		parse: function(eventModel){
			var events_with_hydrated_tags = this.hydrateTags(eventModel);
			return events_with_hydrated_tags;
		},

		hydrateTags: function(eventModel){
			var hydrated_tags = eventModel.tag_ids.map(function(id){
				return collections.impact_tags.instance.findWhere({id: id});
			});
			eventModel.impact_tags_full = hydrated_tags;

			return eventModel;
		}

	})
}
models.exports = {
  "Model": Backbone.Model.extend({
    url: 'exports'
  })
}
// Just a plain old model
models.generic = {
	"Model": Backbone.Model.extend({})
}
models.impact_tag = {
	"Model": Backbone.Model.extend({
		defaults: {
			type: 'impact',
			color: '#6699cc',
			active: false,
			category: null,
			level: null
		},
		toggle: helpers.modelsAndCollections.toggle
	})
}
models.new_article = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/articles'
	})
}
models.org = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/_VERSION/orgs/settings'
	})
}
models.recipe = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		defaults: {
			viewing: false, 
			enabled: true // TODO, we're not using this but could implement, it's used to turn the recipe on and off
		},
		initialize: function(itemObj){
			var keys  = _.chain(itemObj.options).keys().filter(function(key){
							var val = _.clone(itemObj.options[key])
							if (_.isObject(val) && val.input_options) {
								delete val.input_options;
							}
							return /^set_event_/.test(key) && !_.isEmpty(val);
						}).value();
			var set_val = keys.length ? true : false;
			this.set('set_default_event', set_val);

		}
	})
}
models.recipe_creator = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/_VERSION/recipes'
	})
}
models.setting = {
	"Model": Backbone.Model.extend({})
}
models.sous_chef = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle
		
	})
}
models.subject_tag = {
	"Model": Backbone.Model.extend({
		toggle: helpers.modelsAndCollections.toggle,
		defaults: {
			type: 'subject',
			color: '#1f78b4'
		}
	})
}
models.user_setting = {
	"Model": Backbone.Model.extend({
		url: 'api/_VERSION/me'
	})
}
// This is the model that holds our selected alerts
// If it is added to this collection, it's baked to the dom
// If it is removed from this collection, it's removed from the dom
collections.active_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events', // This doesn't need any query paremeters because it isn't used to fetch, just to delete or POST
		comparator: function(alert){
			return alert.created;
		}
	})
}
collections.article_comparisons = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/content?facets=subject_tags,impact_tags,categories,levels&incl_body=false',
		// Set our default options, these all correspond to keys in the article comparisons object. Essentially, what values should we pluck out of that to use as our comparison point
		initialize: function(){
			this.metadata('operation', 'mean');
			this.metadata('group', 'all');
			this.metadata('max', 'per_97_5');

			return this;
		},

		parse: function(response){
			return response.content_items;
		},
		
		// http://stackoverflow.com/questions/17753561/update-a-backbone-collection-property-on-add-remove-reset
		set: function() {
			Backbone.Collection.prototype.set.apply(this,arguments);
			this.updateHash();
		},
		// updateHash on a remove
		remove: function() {
			Backbone.Collection.prototype.remove.apply(this,arguments);
			this.updateHash();
		},
		// updateHash on a add
		add: function() {
			Backbone.Collection.prototype.add.apply(this,arguments);
			this.updateHash();
		},
		// Also update hash on sort
		sort: function(options) {
			if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
			options = options || {};
		
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}

			if (!options.silent) this.trigger('sort', this, options);
			this.updateHash();
			return this;
		},
		setComparator: function(dimensionName){
			var sort_ascending = this.metadata('sort_ascending');

			var comparators = {};
			comparators.text = function(articleComparisonModel){
				var comparison_value = articleComparisonModel.get(dimensionName);
				return comparison_value;
			}
			comparators.date = comparators.text;
			comparators.metric = function(articleComparisonModel){
				var comparison_value = articleComparisonModel.get('metrics')[dimensionName];
				if (!sort_ascending){
					comparison_value = comparison_value*-1;
				}
				return comparison_value;
			}

			comparators.bars = function(articleComparisonModel){
				// These are stored as `subject_tags_full` and `impact_tags_full` on the model, do some string formatting to our metric name 
				// TODO, subject_tags should be sorted alphabetically
				var comparison_value = articleComparisonModel.get(dimensionName+'_full').length
				if (!sort_ascending){
					comparison_value = comparison_value*-1;
				}
				return comparison_value;
			}

			var dimensionKind = _.findWhere( collections.dimensions.instance.getSelectDimensions() , {name: dimensionName}).kind;
			this.comparator = comparators[dimensionKind];

			// Adapted from this http://stackoverflow.com/questions/5013819/reverse-sort-order-with-backbone-js
			// Backbone won't sort non-numerical fields, `this.reverseSortBy` fixes that.
			if ((dimensionKind == 'text' || dimensionKind == 'date') && !sort_ascending){
				this.comparator = this.reverseSortBy(this.comparator);
			}

			return this;
		},
		reverseSortBy: function(sortByFunction) {
			return function(left, right) {
				var l = sortByFunction(left);
				var r = sortByFunction(right);

				if (l === void 0) return -1;
				if (r === void 0) return 1;

				return l < r ? 1 : l > r ? -1 : 0;
			};
		},
		updateHash: function() {
			var sort_by = this.metadata('sort_by'),
					ascending = this.metadata('sort_ascending');
					
			var query_params = '?sort=' + sort_by + '&asc=' + ascending;
			this.hash = this.pluck('id').join('+') + query_params;
		},
		getHash: function() {
			return this.hash; 
		},
		redrawMarkers: function(){
			// Trigger his on the collection itself to update headers
			// The article detail vizs piggy back on this listener to redraw themselves also
			this.trigger('resetMetricHeaders');
				// Trigger this event so each comparison item can redraw itself
			this.models.forEach(function(model){
				model.trigger('redrawMarker');
			});
		}
	})
}
collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url:'/api/_VERSION/content',
		set: function() {
			// Always remove contents before setting so that we can set an existing model
			// Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
			this.updateHash();
		},
		updateHash: function() {
			// This will just have one, unless we're doing a drawer change set which will empty
			if (this.length){
				this.hash = this.first().id;
			}
		},
		getHash: function() {
			return this.hash; 
		},

		// Add color information for promotions
		addLevelColors: function(promotions){
			return promotions.map(function(promotion){
				var color = pageData.attributeColorLookup[promotion.level];
				promotion.color = color;
				return promotion;
			});
		}

	})
}
collections.article_detailed_events = {
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?facets=tags,categories,levels&status=approved&per_page=10&creates=events', 
		parse: function(response){
			this.metadata('pagination', response.pagination);
			this.metadata('total', response.total);
			models.event_tag_facets.set(response.facets);
			return response.events;
		},
		comparator: function(eventItem){
			return eventItem.created;
		}

	})
}
collections.article_detailed_impact_tag_attributes = {
	"categories_instance": null,
	"levels_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		metadata: helpers.modelsAndCollections.metadata
	})
}
// TODO, the url
collections.article_detailed_impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		set: function() {
			// Always remove contents before setting
			Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
		}
	})
}
collections.article_detailed_subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		// setUrl: function(id){
		// 	this.url = '/api/content/'+id+'/tag/';
		// 	return this;
		// }
		// set: function() {
		// 	// Always remove contents before setting
		// 	Backbone.Collection.prototype.remove.call(this, this.models );
		// 	Backbone.Collection.prototype.set.apply(this, arguments);
		// }
	})
}
collections.article_detailed_timeseries = {
	"Collection": Backbone.Collection.extend({

		metadata: helpers.modelsAndCollections.metadata,

		setUrl: function(articleId){
      this.url = 'api/_VERSION/content/'+articleId+'/timeseries?sort=-datetime'
    },

    parse: function(response){
      var metric_selects = ['datetime'].concat(collections.dimensions.instance.metadata('timeseries-selects'));

      var filtered_response = response.map(function(evt){
        return _.pick(evt, metric_selects);
      });

      return filtered_response;
    }

	})
}
collections.article_detailed_tweets = {
  "Collection": Backbone.Collection.extend({

    metadata: helpers.modelsAndCollections.metadata,

    setUrl: function(articleId){
      this.url = 'api/_VERSION/events?sous_chefs=twitter-search-content-item-links-to-event&per_page=100&content_item_ids=' + articleId
    },

    parse: function(response){
      this.metadata('pagination', response.pagination);
      this.metadata('total', response.total);
      return response.events;
    }

  })
}
collections.article_summaries = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/content?facets=subject_tags,impact_tags,categories,levels&incl_body=false',
		parse: function(response){
			this.metadata('pagination', response.pagination);
			this.metadata('total', response.total);
			// This will fire a change event and update counts as well as show hide containers
			models.tag_facets.set(response.facets);

			return response.content_items;
		},
	})
}
// This is most closely tied to metrics but it also includes information like `title` and `created` date which are just pieces of data
collections.dimensions = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		metadata: helpers.modelsAndCollections.metadata,

		initialize: function(){
			// TODO, this should be saved on the user settings list, once that exists
			var selects = [
				{
					name: 'title',
					kind: 'text'
				},{
					name: 'created',
					kind: 'date'
				},{
					name: 'ga_pageviews',
					kind: 'metric'
				},{
					name: 'twitter_shares',
					kind: 'metric'
				},{
					name: 'facebook_likes',
					kind: 'metric'
				},{
					name: 'facebook_shares',
					kind: 'metric'
				},{
					name: 'facebook_comments',
					kind: 'metric'
				},{
					name: 'subject_tags',
					kind: 'bars'
				},{
					name: 'impact_tags',
					kind: 'bars'
				}
			];


			var sortable_dimensions = [	
				'divider-article info',
				'created',
				'title',
				'updated',
				'divider-social',
				'twitter_followers',
				'twitter_shares',
				'facebook_comments',
				'facebook_likes',
				'facebook_shares',
				'googleplus_shares',
				'linkedin_shares',
				'pinterest_shares',
				'reddit_downvotes',
				'reddit_upvotes',
				'fb_page_likes',
				'divider-google analytics',
				'ga_avg_time_on_page',
				'ga_entrances',
				'ga_exits',
				'ga_pageviews',
				'ga_pageviews_by_domain',
				'ga_pageviews_mobile',
				'ga_pageviews_tablet',
				'ga_per_external',
				'ga_total_time_on_page',
				'divider-impact levels',
				'institution_level_events',
				'community_level_events',
				'individual_level_events',
				'internal_level_events',
				'media_level_events',
				'divider-impact categories',
				'change_category_events',
				'citation_category_events',
				'achievement_category_events',
				'promotion_category_events',
				'other_category_events',
				'total_events'
			];

			var timeseries_selects = [
				'ga_pageviews',
				'twitter_shares',
				// 'facebook_likes',
				'facebook_shares',
				// 'facebook_comments'
			];

			this.metadata('selects', selects);
			this.metadata('sortable-dimensions', sortable_dimensions);
			this.metadata('timeseries-selects', timeseries_selects);
		},

		cloneMetrics: function(getAll){ // We're lazy so give this a flag if we want to grab all
			var metrics = [];
			this.metadata('selects').forEach(function(select){
				var metric;
				if (select.kind == 'metric' || getAll){
					metric = _.clone(select); // Beware, we are expecting a non-nested object here
					metrics.push(metric);
				}
			});
			return metrics;
		},

		getSelectDimensions: function(){
			var selects_list = this.cloneMetrics(true),
					dimension_selects = [],
					that = this;

			selects_list.forEach(function(selectInfo){
				var select_name = selectInfo.name,
						dimension_model = that.findWhere({name: select_name}),
						dimension_json;
						
				if (dimension_model){
					dimension_json = _.clone(dimension_model.toJSON()); // Beware, we are expecting a non-nested object here
					_.extend(dimension_json, selectInfo);
					dimension_selects.push(dimension_json);
				}
			});

			return dimension_selects;

		},

		formatSelectsForIsotope: function(){
			var selects = this.cloneMetrics(true),
					selects_for_isotope = {};

			selects.forEach(function(selectInfo){
				var select = {};
				var caster = '';
				if (selectInfo.kind == 'metric' || selectInfo.name == 'impact_tags'){
					caster = ' parseFloat';
				}
				selects_for_isotope[selectInfo.name] = '[data-'+selectInfo.name+']' + caster;
			});

			return selects_for_isotope;
		},

		getSortableDimensions: function(){
			var sd_names = this.metadata('sortable-dimensions'),
			    sortable_dimensions = [];

			sd_names.forEach(function(sdName){
				var sorter = this.findWhere({name: sdName});

				if ( /^divider-/.test(sdName) ) {
					sorter = {
						name: sdName.replace('divider-', '')+'...',
						sort_name: '',
						disabled: true
					};
					sortable_dimensions.push({
						name: ' ',
						sort_name: '',
						disabled: true
					});
				} else if (sorter) {
					sorter = sorter.toJSON();
				}

				if (sorter){
					sortable_dimensions.push(sorter);
				}

			}, this);

			return sortable_dimensions;
		}

	})
}
collections.impact_tag_attributes = {
	"categories_instance": null,
	"levels_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		metadata: helpers.modelsAndCollections.metadata
	})
}
collections.impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
    metadata: helpers.modelsAndCollections.metadata,
		url: function(){
			return '/api/_VERSION/tags'
		}
	})
}
collections.loaded_alerts = {
	"recipe_all_instance": null, // One instance is creaeted for every recipe
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?status=pending&creates=events',
		parse: function(eventsInfo){
			this.metadata('pagination', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			return eventsInfo.events;
		}
	})
}
// PourOver collections
collections.po = {
	sorts: {}
};
collections.recipes = {
	"instance": null,
	"schemas_instance": null,
	"Collection": Backbone.Collection.extend({
		url: '/api/_VERSION/recipes',
		model: models.recipe.Model,
		setBoolByIds: helpers.modelsAndCollections.setBoolByIds
		// comparator: function(recipe){
		// 	return -recipe.id;
		// }
	})
}
// This collection holds our out-of-the-box recipe that handle article ingestion
collections.article_rss_feeds = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		// model: models.rss_feed.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/alerts'
	})
}
collections.settings = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.setting.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/orgs/settings'
	})
}
collections.sous_chefs = {
	"instance": null,
	"schemas_instance": null,
	"Collection": Backbone.Collection.extend({
		url: '/api/_VERSION/sous-chefs',
		model: models.sous_chef.Model,
		setBoolByIds: helpers.modelsAndCollections.setBoolByIds
		// comparator: function(recipe){
		// 	return -recipe.id;
		// }
	})
}
collections.subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: function(){
			return '/api/_VERSION/tags'
		}
	})
}
collections.user_settings = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.user_setting.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/me'
	})
}
Backbone.View.prototype.killView = function() {

	if (this._time_picker) { this._time_picker.destroy(); }
	this.killAllSubviews();
	this.undelegateEvents();
	this.remove();

	return this;
	
}

Backbone.View.prototype.setGlobalLoading = function() {

	$('body').attr('data-loading', 'internal-link');

	return this;
	
}

Backbone.View.prototype.silenceView = function() {

	this.silenceAllSubviews();
	this.undelegateEvents();
	if (this._time_picker) { this._time_picker.destroy(); }

	return this;

}

Backbone.View.prototype.silenceAllSubviews = function() {

	if (this._subviews && _.isArray(this._subviews)){
		this._subviews.forEach(function(subview){
			subview.silenceView();
		});
		this._subviews = [];
	}

	return this;

}

Backbone.View.prototype.killAllSubviews = function() {

	if (this._subviews && _.isArray(this._subviews)){
		this._subviews.forEach(function(subview){
			subview.killView();
		});
		this._subviews = [];
	}

	return this;

}
views.AA_BaseArticleViz = Backbone.View.extend({

	tagName: 'section',

	className: 'article-detail-viz-container',

	setMarkup: function(){
		this.setTitle();
		this.setContainer();
	},

	setTitle: function(){
		this.$el.html('<h3 class="title">'+this.section_title+'</h3>');
		return this;
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // `mean` or `median`
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // `all` for now
		this.comparison_marker_max 				= 'max';
		// this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('max');

		return this;
	},

	setContainer: function(){
		this.$vizContainer = $('<div class="viz-container"></div>').appendTo(this.$el);
		return this;
	},

	fancyPercent: function(decimal){
		if (decimal < .01) { 
			return '<1%'; 
		} else {
			return Math.round(decimal*100) + '%';
		}

	},

	render: function(renderMarker){
		var self = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		var bar_container = _columns.append('div')
			.classed('bar-container', true);


		// Do the bullet
		bar_container.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.value / self.total)*100).toFixed(2) + '%';
				});

		// And the marker
		// But only if that's set
		// It's currently not being drawn for domain referrers bc we don't have that data
		// TODO, maybe cache this value so we're not calculating it multiple times
		var bullet_markers;
		if (renderMarker){
			bullet_markers = bar_container.append('div')
				.classed('marker-container', true)
				.style('left', function(d) { 
					return self.calcLeftOffset(d.facet, self.comparison_marker_operation);
				})
				.classed('tooltipped', true)
				.attr('aria-label', function(d){
					var dimension = helpers.templates.toTitleCase(self.comparison_marker_operation);

					if (dimension == 'Mean'){
						dimension = 'Average'
					}
					return dimension + ' of ' + self.comparison_marker_group + ' articles: ' + self.calcLeftOffset(d.facet, self.comparison_marker_operation);
				})
				.attr('data-tooltip-align', function(d){
					var leftOffset = parseInt(self.calcLeftOffset(d.facet, self.comparison_marker_operation)),
							alignment = 'center';

					if (leftOffset <= 20){
						alignment = 'left'
					} else if (leftOffset > 75) {
						alignment = 'right'
					}

					return alignment;
				})
				.append('div')
					.classed('marker', true);
		}

		bar_container.append('div')
					.classed('label', true)
					.html(function(d){
						var percent = self.fancyPercent(d.value/self.total),
								count = (d.value) ? (helpers.templates.addCommas(d.value)) : ''; // Only print this string if count isn't zero

						return '<span class="bolded">' + helpers.templates.toTitleCase(d.facet_display_name) + '</span> &mdash; ' + percent+ ', ' + count;
					});

		this.bar_container = bar_container;

		return this;

	},

	redrawMarker: function(){
		this.calcComparisonMarkerParams();

		var self = this;
		var markers = this.bar_container.selectAll('.marker-container') 
			.style('left', function(d){
				var d3_el = d3.select(this),
						metric_name = d.facet
				return self.calcLeftOffset.call(self, metric_name, self.comparison_marker_operation, self.comparison_marker_group, self.comparison_marker_max);
			});

		// var that = this;
		// // Don't save a cached selector because then sometimes we'll have that var and sometimes we won't
		// // A better is to make a selection on redraw, which will either be empty or have something
		// var markers = this.bar_container.selectAll('.marker-container') 
		// 		.transition()
		// 		.duration(450)
		// 		.ease('exp-out')
		// 		.styleTween('left', function(d) { 
		// 			// This is madness, but d3 requires us to venture to such depths
		// 			// D3 won't interpolate a starting value in the way you think
		// 			// So if you want to interpolate from left 23% to left 26%
		// 			// It will interpolate from the pixel representation of 23% to 20%
		// 			// So that will go from 10px to 20%, the 10px acts like a percent
		// 			// So we reverse engineer the percent from the pixel value wrt to its parent container
		// 			// And set that as the starting percentage
		// 			// Some reference https://github.com/mbostock/d3/issues/1070
		// 			var starting_px = parseFloat(d3.select(this).style('left')),
		// 					parent_px = this.parentNode.offsetWidth,
		// 					starting_percent = starting_px/parent_px * 100,
		// 					ending_percent = that.calcLeftOffset(d.facet, that.comparison_marker_operation),
		// 					ending_pixel = parseFloat(ending_percent)* parent_px;

		// 			return d3.interpolate(starting_percent, ending_percent); 
		// 		})
		// 		.attr('aria-label', function(d){
		// 			return helpers.templates.toTitleCase(that.comparison_marker_operation) + ' of ' + that.comparison_marker_group + ' articles: ' + that.calcLeftOffset(d.facet, that.comparison_marker_operation);
		// 		})

	},

	calcLeftOffset: function(metric, operation, group){
	/** Metric options: per97_5, per75, median, per25, per2_5, per5, per95, mean **/
		group = group || this.comparison_marker_group;
		var max_field = this.comparison_marker_max;

		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object;
		if (group == 'all'){
			comparison_object = models.comparison_metrics.get(group);
		} else {
			comparison_object = models.comparison_metrics.get('subject_tags')[group];
		}

		var this_metrics_comp_info = _.findWhere(comparison_object, {metric: metric}),
				val,
				max,
				scale,
				val_percent;

		// console.log(this_metrics_comp_info)

		if (this_metrics_comp_info){
			val = this_metrics_comp_info[operation];
			max = this_metrics_comp_info[max_field];

			scale = d3.scale.linear()
									.domain([0, max])
									.range([0, 97]);

			if (!val && val !== 0){
				console.log('ERROR: Missing max comparison value for group:', group, 'And metric:', metric, 'For operation:', operation);
				val = 0;
			}

			// console.log(metric, val, Math.round(scale(val)).toString())
			// console.log(max_field, max, val, scale(val))

			val_percent = Math.round(scale(val)).toString() + '%';
			
		}else{
			console.log('ERROR: Missing comparison values for group', group, 'and metric', metric, 'for group', group, 'in comparison object', comparison_object);
			val_percent = '0%';
		}

		// console.log(val_percent)

		return val_percent;		
	}


});
views.AA_BaseForm = Backbone.View.extend({

	events: {
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .article-assignee': 'removeArticleAssignee'
	},

	killPropagation: function(e){
		e.stopPropagation();
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	setProcessing: function(e, processing){
		var $form = $(e.currentTarget)
		$form.attr('data-processing', processing)
	},

	// keyBeenPressed: function(e){
	// 	var return_key_code = 13;

	// 	console.log(e.keyCode)

	// 	if (e.keyCode == return_key_code){
	// 		e.stopPropagation();
	// 		e.preventDefault();
	// 	}
	// },

	assignmentTemplateFactory: _.template('<div class="article-assignee""><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\'/></div>'),

	bakeModal: function(title){
		var modal_markup = '';
		// modal_markup += '<div class="modal-outer">';
			modal_markup += '<div class="modal-overlay"></div>';
			modal_markup += '<div class="modal-inner">';
				modal_markup += '<div class="modal-title">'+title+'</div>';
				modal_markup += '<form></form>';
			modal_markup += '</div>';
		// modal_markup += '</div>';

		var $target = (this.$el.hasClass('modal-outer')) ? this.$el : this.$el.find('.modal-outer');
		$target.append(modal_markup);
		this.$form = $target.find('form');
		return this;
	},

	refresh: function(enabled){
		this.render();
		this.postRender(enabled);
	},

	postRender: function(enabled){

		if (enabled.search) { this.initArticleTitleSearcher(); }
		if (enabled.pikaday) { this.initPikaday(); }
		this.$submitMsgText = this.$el.find('.submit-msg');

		var el_modal_outer = this.$el.find('.modal-outer')[0];

		// Our submit page doesn't use d3 because there's no dragging
		if (window.d3 !== undefined){
			d3.select(el_modal_outer).call(this.drag());
		}

		return this;
	},

	// Override this in parent views
	removeSetEventPrefix: _.identity,

	bakeFormInputRow: function(fieldName, data, isDefaultEvent, selectedVal){
		var groups = {
			time_of_day: 'schedule_by',
			crontab: 'schedule_by',
			minutes: 'schedule_by'
		};

		var type = data.input_type,
				is_hidden = (type == 'hidden'),
				field_name_pp = this.prettyName(fieldName, data.type),
				which_name = this.removeSetEventPrefix(fieldName),
				markup = '',
				has_help_link = (data.help && data.help.link),
				has_help_desc = (data.help && data.help.description),
				skipped_fields = ['slug'],
				group = groups[which_name] || '';

		isDefaultEvent = isDefaultEvent || false;

		if (!_.contains(skipped_fields, fieldName)){
			// Bake the general row container, the label and the input container
			markup = '<div class="form-row" data-which="'+which_name+'" data-group="'+group+'" data-hidden="'+is_hidden+'">';
				markup += '<div class="form-row-label-container '+((has_help_link) ? 'has-help-link' : '')+'">';
					markup += '<label for="'+fieldName+'"> '+field_name_pp+((has_help_desc) ? '<span class="tooltipped supertext" aria-label="'+data.help.description+'">?</span>' : '' )+'</label> ';
					if (has_help_link) markup += '<a class="help-text supertext tooltipped" href="'+data.help.link+'" target="_blank" aria-label="Show documentation.">Docs</a>'; 
				markup += '</div>';
				markup += '<div class="form-row-input-container" data-which="'+which_name+'">';
					// Get the appropriate markup
					if (!this.formJsonToMarkup[type]){
						console.log('ERROR: Your specified `input_type` of ', type, 'on the object', data, 'is missing a corresponding function in `formJsonToMarkup`');
					}
					markup += this.formJsonToMarkup[type].call(this, fieldName, data, isDefaultEvent, selectedVal, data.type);
				markup += '</div>';
			markup += '</div>';
		}

		return markup;
	},

	formJsonToMarkup: {

		search: function(fieldName, data, isDefaultEvent){
			// Rename the field name
			fieldName = 'assignees-selector';

			// var required = data.required ? 'required' : '';

			// Give this a normal text input now, minus the data value, we'll instantiate the article searcher and load selecteds after it's been added to the DOM
			var input_markup = '<input type="text" name="'+fieldName+'" class="'+fieldName+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" data-is-default-event="'+isDefaultEvent+'" data-serialize-skip="true"/>';

			return input_markup;
		},

		content_items: function(assignees){
			var markup = '';
			assignees.forEach(function(assignee){
				markup += this.assignmentTemplateFactory(assignee);
			}, this);
			return markup;
		},

		set_event_content_items: function(assignees){
			return this.formJsonToMarkup.content_items.call(this, assignees);
		},

		datepicker: function(fieldName, data, isDefaultEvent){
			var class_name = this.removeSetEventPrefix(fieldName);

			var required = data.required ? 'required' : '';

			// Give this a normal timestamp input, we'll instantiate pikaday after it's been added to the DOM
			// This first input is for the pikaday select and display
			var input_markup = '<input type="text" data-type="datepicker" class="'+class_name+'" '+required+' placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" autocomplete="off" data-is-default-event="'+isDefaultEvent+'" data-serialize-skip="true"/>';
			// Make an input sibling that will be what we read the data from
			input_markup += '<input type="hidden" name="'+fieldName+'" data-type="datepicker-value" class="'+class_name+'" data-is-default-event="'+isDefaultEvent+'"/>';
			
			return input_markup;
		},

		textNumberOrHidden: function(fieldName, data, which, isDefaultEvent, selectedVal, serializeFn){
			serializeFn = serializeFn || 'auto';
			// TODO, investigate why value needs to be double escaped for Brian's version of Chrome.
			var value = this.escapeQuotes(selectedVal),
					class_name = this.removeSetEventPrefix(fieldName);

			var required = data.required ? 'required' : '';


			var input_markup = '<input type="'+which+'" name="'+fieldName+':'+serializeFn+'" class="'+class_name+'" value="'+this.escapeQuotes(value)+'" '+required+' placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" '+((which == 'number') ? 'min="0"' : '') +' data-is-default-event="'+isDefaultEvent+'"/>';
			
			return input_markup;
		},

		text: function(fieldName, data, isDefaultEvent, selectedVal){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'text', isDefaultEvent, selectedVal);
		},

		hidden: function(fieldName, data, isDefaultEvent, selectedVal){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'hidden', isDefaultEvent, selectedVal);
		},

		searchstring: function(fieldName, data, isDefaultEvent, selectedVal){
			// Do the same as text
			return this.formJsonToMarkup.text.call(this, fieldName, data, isDefaultEvent, selectedVal);
		},


		'string-to-list': function(fieldName, data, isDefaultEvent, selectedVal){
			// Do the same as text
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'text', isDefaultEvent, selectedVal, 'string-to-list');
		},

		number: function(fieldName, data, isDefaultEvent, selectedVal){
			return this.formJsonToMarkup.textNumberOrHidden.call(this, fieldName, data, 'number', isDefaultEvent, selectedVal);
		},

		paragraph: function(fieldName, data, isDefaultEvent, selectedVal){
			var value = this.escapeQuotes(selectedVal) || '',
					class_name = this.removeSetEventPrefix(fieldName);

			var input_markup = '<textarea type="text" name="'+fieldName+'" class="'+class_name+'" placeholder="'+((data.help && data.help.placeholder) ? this.escapeQuotes(data.help.placeholder) : '') +'" data-is-default-event="'+isDefaultEvent+'">'+value+'</textarea>';
			
			return input_markup;
		},

		select: function(fieldName, data, isDefaultEvent, selectedVal){
			var class_name = this.removeSetEventPrefix(fieldName);

			var required = data.required ? 'required' : '';

			var input_markup = '<select class="'+class_name+'" name="'+fieldName+':auto" data-is-default-event="'+isDefaultEvent+'" '+required+'>';

			_.each(data.input_options, function(option){
				var selected = '';
				if (selectedVal == option) {
					selected = 'selected';
				}
				input_markup += '<option value="'+option+'" '+selected+'>'+this.prettyName(option)+'</option>';
			}, this);
			input_markup += '</select>';
			
			return input_markup;
		},

		'checkbox-single': function(fieldName, data, isDefaultEvent, selectedVal, type){
			var input_markup = '',
					namespacer = 'NewsLynx'; // To avoid id collisions

			data.input_options.forEach(function(checkboxItemObj, idx){
				var checkboxId = _.uniqueId(namespacer + '|' + fieldName + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
				var checked = (selectedVal) ? 'checked' : '';
				
				input_markup += '<input id="'+checkboxId+'" name="'+fieldName+':reverse-boolean" value="false" type="checkbox" ' + checked + ' data-is-default-event="'+isDefaultEvent+'"/>';
				input_markup += '<label for="'+checkboxId+'" >Yes</label>';
			})
			return input_markup
		},

		checkbox: function(fieldName, data, isDefaultEvent, selectedVal, type){
			var input_markup = '',
					namespacer = 'NewsLynx'; // To avoid id collisions

			if (!data.input_options.length){
				input_markup = '<span class="placeholder">You haven\'t yet made any '+fieldName.replace(/^set_event_/,'').replace(/_/g,' ')+' yet. Create them on the <a href="/settings" target="_blank" class="out-link">Settings</a> page.</span>';
			}

			// var len = data.input_options.length;
			_.each(data.input_options, function(checkboxItemObj, idx){
				var style = this.styleCheckboxLabel(checkboxItemObj);
				var checkboxId = _.uniqueId(namespacer+'|'+fieldName + '|' + checkboxItemObj.id + '|'); // `form.serializeArray()` will turn this into a data value so later on we'll to remove the number from this value since it will needed to become a generic property name on the key. 
				input_markup += '<div class="form-checkbox-group tags">';
					var checked = '';
					var selected_ids = selectedVal;
					if (_.contains(selected_ids, checkboxItemObj.id)) {
						checked = 'checked';
					}
					var tooltipped = (type !== 'subject') ? 'tooltipped' : '';
					// var label_orientation = (idx != (len - 1)) ? '' : 'right';
					input_markup += '<input class="tag" id="'+checkboxId+'" name="'+fieldName+'[]:number" value="'+checkboxItemObj.id+'" type="checkbox" ' + checked + ' data-is-default-event="'+isDefaultEvent+'"/>';
					input_markup += '<label class="tag '+tooltipped+'" data-tooltip-orientation="right" for="'+checkboxId+'" '+style+' aria-label="'+checkboxItemObj.level+' '+checkboxItemObj.category+'" >'+checkboxItemObj.name+'</label>';
				input_markup += '</div>';
			}, this);

			return input_markup;
		}

	},

	styleCheckboxLabel: function(checkboxItemObj){
		// console.log(checkboxItemObj, checkboxItemObj.color)
		var bgColor = checkboxItemObj.color,
				color = this.whiteOrBlack(bgColor);

		return 'style="background-color:'+bgColor+';color:'+color+';"';
	},

	prettyName: function(name, type){
		// Standardize name to remove the `set_event_` prefix used in keys on default event creator forms like when creating or modifying a recipe
		if (/^set_event_/.test(name)){
			name = name.replace('set_event_', '');
		}
		if (name === 'tag_ids' && type === 'subject'){
			name = 'subject_tag_ids';
		}
		// Make any name changes here to prettify things that might not be terribly evident what they do from their API slug.
		var name_changes = {
			'q': 'search_query',
			'content_items': 'Assign to..',
			'url': 'URL',
			'img_url': 'Image URL',
			'filter': 'search_query',
			'min_followers': 'min. followers',
			'tag_ids': 'impact tag(s)',
			'subject_tag_ids': 'Subject tag(s)',
			'datetime': 'date / time',
			'create': 'date / time',
			'interval': 'interval (seconds)',
			'title': 'event title'
		};

		if (name_changes[name]) {
			name = name_changes[name];
		}
		if (!name) {
			name = '';
		}
		name = name.replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
	},

	escapeQuotes: function(term){
		if (term === 0) { return term; }
		if (!term) { return ''; }
		if (typeof term !== 'string') { return term };
		return term.replace(/"/g,'&quot;')
	},

	prettyDatestamp: function(utcDate){
		return new Date(utcDate).toLocaleString();
	},

	initArticleTitleSearcher: function(){
		var $typeahead = this.$el.find('.assignees-selector'),
				self = this;

		// TEMPORARY until we fully eliminate `combineForm` stuff
		// For now, mimic the structure it's expecting
		// if (!content_items && this.form_info.vals){
		// 	content_items = {
		// 		selected: this.form_info.vals.content_items
		// 	}
		// }

		this.$typeaheadRow = $typeahead.parents('.form-row');
		$('<div class="form-row article-assignees" ></div>').insertAfter(this.$typeaheadRow);

		$typeahead.typeahead({
			highlight: true,
			minLength: 3
		},{
			name: 'content-items',
			displayKey: 'title',
			async: true,
			source: function(query, syncResults, asyncResults){
				var query_url = '/api/_VERSION/content?q='+query+'&search=title&fields=id,title';
				$.ajax({
					url: query_url,
					dataType: 'json',
					success: function(results){
						asyncResults(results.content_items);
					}
				});
			}
		});

		$typeahead.on('typeahead:selected', function(e, d){
			e.preventDefault();
			// Clear this val on selection
			$(this).typeahead('val', '');
			// Add selection down below
			self.addArticleAssignee(d, content_items);
		});

		// Load the selecteds, if they exist
		var content_items;
		if (this.form_info && this.form_info.vals.content_items){
			this.form_info.vals.content_items.forEach(function(contentItem){
				self.addArticleAssignee(contentItem, []);
			});
		}

		return this;
	},

	addArticleAssignee: function(newContentItem, existingContentItems){
		var $articleAssignments,
				id,
				form_data,
				markup;

		if (newContentItem){
			$articleAssignments = this.$el.find('.form-row.article-assignees');
			id = newContentItem.id;

			var form_data = this.getSettings(true); // `true` means get the default event values also

			// Currently, selecting an article won't remove it from the typeahead options, so as a fix, don't add things if they already exist
			if (!_.contains(_.pluck(existingContentItems, 'id'), id)){

				markup = this.assignmentTemplateFactory(newContentItem);
				$articleAssignments.append(markup);
			}
			
		} else {
			console.log('ERROR: Article assignee not found');
		}

		return this;
	},

	removeArticleAssignee: function(e){
		// Remove from DOM
		$(e.currentTarget).remove();
		return this;
	},

	initPikaday: function(){
		// TODO, future plan, refactor this function so that it could could detect multiple datepicker values and init them. 

		var time_picker,
				that = this,
				$el = this.$el.find('input[data-type="datepicker"]'),  // This convention of using `data-type` breaks from our current convention of using names. But those names follow data key fields. In this case, `created`, is a bit too specific. This gives us flexibility in making text fields Pikaday instances without them being tied to a specific datakey. see `formJsonToMarkup.datepicker` for where this is set.
				el = $el[0], // Pikaday wants a pure dom object, not a jquery object
				$form_el = $el.siblings('input[data-type="datepicker-value"]'); // We create a sibling value that stores the properly formatted date string so we can use the $el input for a prettier display;

		time_picker = new Pikaday({
			field: el,
			showTime: true,
			use24hour: true,
			timezone: pageData.timezone,
			// clearInvalidInput: true,
			// onOpen: function(){
			// 	// console.log('existing',this.toString())
			// },
			onSelect: function(){
				var moment_timezone_date = this.getMoment(),
						full_date_string = moment_timezone_date.format(),
						pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

				$form_el.val(full_date_string);
				$el.val(pretty_date_string);

				// console.log('form_el',full_date_string)
				// console.log('el',pretty_date_string)
			}
			// ,
			// onClear: function(){
			// 	// // Clear the timestamp on error or non-date value
			// 	// that.form_data.timestamp = null;
			// }
		});
		// var date_obj_in_schema = _.findWhere(this.form_info.schema, {input_type: 'datepicker'}) || {}; // Give a `{}` if undefined so the next line will fail gracefully
		// var datepicker_key_name = Object.keys(date_obj_in_schema)[0];
		// var selected_date = this.form_info.vals[datepicker_key_name];

		var selected_date;
		// This won't always have a value, if we're initing pikaday without preloading
		if (this.form_info){
			selected_date = moment(this.form_info.vals.created);
			time_picker.setMoment(selected_date);
		}

		this._time_picker = time_picker;
		return this;
	},

	whiteOrBlack: function(bgColorHex){
		var rgbColor = this.hexToRgb(bgColorHex);
		var r = rgbColor.r,
				g = rgbColor.g,
				b = rgbColor.b;
		var yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	},

	hexToRgb: function(hex){
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		    return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},

	bakeButtons: function(includeDelete){
		var markup = '<div class="buttons-container">';
			// Cancel
			markup += '<button class="cancel modal-close">Cancel</button>';
			// Save
			markup += '<input class="save" type="submit" value="Save"/>';
			markup += '<span class="submit-msg"></span>'
			// Delete (optional)
			if (includeDelete){
				markup += '<input class="destroy" type="button" value="Delete"/>';
			}
		// Close button container
		markup += '</div>';
		return markup;
	},

	validate: function(schema, formData, cb, ctx){

		var required_keys = [];

		_.each(schema, function(val, key){
			if (val.required){
				required_keys.push(key);
			}
		});

		var existing_keys = _.keys(formData),
				existing_vals = _.values(formData),
				msg,
				missing_keys = [], // We'll do a few tests and push the missing keys into here and then flatten
				s = '';
		// Test if we flat out missed some
		missing_keys.push(_.difference(required_keys, existing_keys));

		// Test if some are empty by testing for null and length. This will break on a number so do some type testing first
		_.each(formData, function(existingVal, existingKey){
			if (existingVal === undefined || existingVal === false || existingVal === ''){
				missing_keys = missing_keys.concat(existingKey);
			}
		});

		// Flatten this weird array structure we've made
		missing_keys = _.flatten(missing_keys);

		// And we're only interested in required ones
		missing_keys = _.intersection(required_keys, missing_keys);
		if (missing_keys.length > 0){
			if (missing_keys.length > 1){
				s = 's';
			}

			missing_keys = missing_keys.map(function(missingKey){ 
				return '"' + helpers.templates.toTitleCase(missingKey).replace(/_/g, ' ') + '"';
			}).join(', ');

			msg = 'You didn\'t include information for the required field' + s + ': ' + missing_keys + '.'
			cb.call(ctx, 'Missing fields', msg);
		} else {
			cb.call(ctx, null, 'Saving!');
		}
	},

	printMsgOnSubmit: function(error, msg){
		var class_name = (error) ? 'fail' : 'success';
		
		this.$submitMsgText.removeClass('success').removeClass('fail');
		this.$submitMsgText.addClass(class_name).html(msg);
	},

	getSettings: function(setDefaultEvent){

		// Skip any that we've decided are skippable
		var $form_selector = this.$el.find('form :input[data-serialize-skip!="true"]').filter(function(){
			var $this = $(this);
			// Only take inputs that have values, have values that are `0`, or are a part of `set_event_`, which we're okay being null.
			return $this.val() || $this.val() === 0 || /^set_event_/.test($this.attr('name'));
		});


		// If we don't want to set default event options
		// Only include the non-default-evnt input fields in our serializer when creating the json
		if (!setDefaultEvent){
			$form_selector = $form_selector.filter(function(){
				return !$(this).attr('data-is-default-event') || $(this).attr('data-is-default-event') == 'false';
			});
		}

		var form_options = $form_selector.serializeJSON({
			checkboxUncheckedValue: true,
			customTypes: {
				// Split on comma and trim white space
				'reverse-boolean': function(str) {
					// Adapted from serializejson source
					var falses = ["false", "null", "undefined", "", "0"]; 
					return falses.indexOf(str) !== -1; 
				},
				'string-to-list': function(val){
					return val.split(',').map(function(str){
						return str.trim();
					})
				}
			}
		});

		return form_options;

	},

	drag: function(){
		return d3.behavior.drag()
						.on('drag', function(d,i,e) {
							// FF has a bug where it will allow for drag when the mouse is selected text in an input field
							// This means that if you try to click and select text, it will move the window
							// Same thing for other browser on the scrollbar of the impact tags
							// As a fix, disable all dragging if you're within an input child
							if (this.canDrag){
								var D3_modal_inner = d3.select(this).select('.modal-inner'),
										top = parseInt(D3_modal_inner.style('top')),
										left = parseInt(D3_modal_inner.style('left'));

								top += d3.event.dy;
								left += d3.event.dx;

								D3_modal_inner.style('top', top+'px').style('left', left+'px');
								
							}
						})
						.on('dragstart', function(){
							var elements_to_not_drag = ['.form-row-input-container'],
									$dragging_element = $(d3.event.sourceEvent.explicitOriginalTarget);

							var can_drag = _.every(elements_to_not_drag, function(elementToDrag){
								if ($dragging_element.hasClass(elementToDrag.replace('.',''))){
									return false;
								} else if ($dragging_element.parents(elementToDrag).length > 0){
									return false;
								} else {
									return true;
								}
							});

							this.canDrag = can_drag;

						})
	},

	flashSubmitMsg: function(error, msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		this.$submitMsgText.removeClass('success').removeClass('fail');
		// Fade out message, then make sure it's visible for the next time
		this.$submitMsgText.addClass(class_name).html(msg).delay(7000).fadeOut(500).delay(750)
           .queue(function(next) { 
           	$(this).html('').removeClass(class_name).show();
           	next(); 
           })
	},

	toggleBtnsDisabled: function(){
		this.$form.find('.buttons-container').toggleClass('disabled');
	}

});


views.AA_BaseRecipe = views.AA_BaseForm.extend({

	events: _.extend({
		'change .schedule_by': 'getScheduleByVal'
	}, views.AA_BaseForm.prototype.events),

	assignmentTemplateFactory: _.template('<div class="article-assignee"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="set_event_content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\' data-is-default-event="true"/></div>'),

	removeSetEventPrefix: function(fieldName){
		return fieldName.replace(/^set_event_/, '');
	},

	getScheduleByVal: function(e){
		var $select = $(e.currentTarget),
				val = $select.val();

		this.updateScheduleByLayout(val);

		return this;
	},

	updateScheduleByLayout: function(val){
		// If this is called with no value, trigger a change event, which will grab the value and update the layout
		// Useful for setting layout on load
		if (val){
			this.$form.find('.form-row[data-group="schedule_by"][data-which!="'+val+'"]').hide();
			this.$form.find('.form-row[data-group="schedule_by"][data-which="'+val+'"]').show();
		} else {
			this.$form.find('.schedule_by').trigger('change');
		}

		return this;
	},

	separateSchemaFromEvent: function(optionsJson){
		var settingsInfo = _.pick(optionsJson, function(val, key){
			return !/^set_event_/.test(key);
		});
		var eventInfo = _.pick(optionsJson, function(val, key){
			return /^set_event_/.test(key);
		});
		return {settingsInfo: settingsInfo, eventInfo: eventInfo};

	}

});
views.AA_BaseSetting = Backbone.View.extend({

	events: {
		'change .js-input-item.color-picker': 'inputHasChanged',
		'keyup .js-input-item': 'inputHasChanged',
		'keypress .js-input-item': 'inputHasChangedFromKeypress',
		'change .js-input-item': 'inputHasChanged',
		'click .js-input-item': 'inputHasChanged',
		'change select.js-input-item': 'inputHasChanged',
		'click .input-action-btn[data-which="cancel"]': 'revertToPreviousSettingVal',
		'submit .js-parent-form': 'saveModel',
		'click .modal-overlay': 'toggleModal',
		'click .modal-close': 'toggleModal',
		'click .multi-child.js-destroy': 'toggleModal',
		'click input.js-destroy': 'destroyModel'
	},

	keepPreviousValueIfExists: false,

	initializeBase: function(){

		// Cache selectors
		this.$form = this.$el.find('form');

		// Listen for model changes to show or hide buttons
		this.listenTo(this.model, 'change:input_val', this.compareFormData);
		this.listenTo(this.model, 'change:data_changed', this.setDataChanged);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'error', this.error);
		this.listenTo(this.model, 'invalid', this.error);

		return this;

	},

	remove: function(){
		this.$el.animate({
			opacity: 0
		}, 400, 'easeOutQuart').animate({
			height: 0
		}, 175, 'easeOutQuart')
		.queue(function(next) { 
				$(this).remove();
				next(); 
		});

		return this;
	},

	error: function(model, error){
		console.log('####### MODEL SAVE ERRROR #######');
		console.log(model.toJSON());
		console.log(JSON.stringify(error));
		console.log('####### end model save error #######');
		alert('There was an error saving. Please open your console and paste the output to merlynne@newslynx.org. Or follow its instructions if present.');
		return this;
	},

	postRender: function(){

		// Add cancel and save buttons
		this.bakeInputActions();

		// Determine whether this data is changed or not on load
		// Most browsers will preserve the values in the input field on page refresh
		// This will let us know if those values on load are different from what's stored in our data model
		this.compareFormData();

		return this;
	},

	inputHasChanged: function(e){
		// e.preventDefault();
		e.stopPropagation();
		// Save the input to an attribute unless we just hit the return key
		// In that case, submit the form
		var return_key_code = 13,
				esc_key_code = 27,
				command_key_modifying = e.metaKey,
				incoming_val;

		if (e.keyCode == esc_key_code){
			this.revertToPreviousSettingVal(e);
		} else {
			incoming_val = this.getCurrentFormData();
			this.model.set('input_val', incoming_val);
		}


		return this;
	},

	inputHasChangedFromKeypress: function(e){
		var return_key_code = 13,
				command_key_modifying = e.metaKey;

		if (e.keyCode == return_key_code && command_key_modifying) {
			this.saveModel(e);
		} else if (e.keyCode == return_key_code && !command_key_modifying){
			e.preventDefault();
			e.stopPropagation();
		}

	},

	compareFormData: function(){
		var saved_data = this.getRelevantSavedFormData(),
				current_data = this.model.get('input_val') || this.getCurrentFormData(),
				data_is_different = !_.isEqual(saved_data, current_data);

		// console.log('saved',saved_data)
		// console.log('current',current_data)

		this.model.set('data_changed', data_is_different);

		return this;
	},

	setDataChanged: function(model, value){
		this.$form.attr('data-changed', value.toString());
		return this;
	},

	getCurrentFormData: function(){
		var form_data = this.$form.serializeJSON();
		var standardized_form_data = this.standardizeEmptyFields(form_data);
		return standardized_form_data;
	},

	getRelevantSavedFormData: function(){
		// Our saved form data includes things that we aren't asking for input in the form such as org id
		// We use this function when we want to replace the data in the form with the saved data,
		// but we only need to ask for the keys that are used in the input
		// which we can take from the serialized form
		// That object has the right keys but bad values
		// So for each of its keys, grab the saved values

		var f = $.serializeJSON,
				data_object = $.extend(true, {}, this.model.toJSON()),
				opts = f.setupOpts({}),
				keys_list = [],
				output_object = {};

		this.$form.find('input,select').each(function(){
			var input_name = $(this).attr('name'),
					keys;

			if (input_name){
			  keys = f.splitInputNameIntoKeysArray(input_name, opts);
				keys_list.push(keys);
			}

		});

		var keys_value_list = keys_list.map(function(keys){
			var type = keys.pop(); // Remove the last value, which is its caster
			// TODO, maybe do something with type to cast vars
	  	var val = this.deepGet(data_object, keys);
      return {keys: keys, value: val}
		}, this);

		keys_value_list.forEach(function(keysValue){
			f.deepSet(output_object, keysValue.keys, keysValue.value, opts);
		}, this);

		return output_object;

	},

	standardizeEmptyFields: function(obj) {
     var clone = _.clone(obj);
     _.each(clone, function(val, key) {
       if(!val) {
         clone[key] = ''; // Set this to empty string, which will fire a change event on load, showing the cancel and save buttons, per https://github.com/newslynx/opportunities/issues/33
       } else if (_.isObject(val)) {
       	clone[key] = this.standardizeEmptyFields(val);
       }
     }, this);
     return clone;
  },


	bakeInputActions: function(){
		var $form = this.$form;
		var buttons_markup = templates.inputActionsFactory({}); // Our template accepts no data options
		var $modal = $( templates.modalFactory({}) );

		$modal.appendTo($form);
		$form.append(buttons_markup);

		var drag = d3.behavior.drag()
					.on('drag', function(d,i,e) {
						// FF has a bug where it will allow for drag when the mouse is selected text in an input field
						// This means that if you try to click and select text, it will move the window
						// Same thing on the scrollbar of the impact tags
						// As a fix, disable all dragging if you're within an input child
						if (this.canDrag){
							var D3_modal_inner = d3.select(this).select('.modal-inner'),
									top = parseInt(D3_modal_inner.style('top')),
									left = parseInt(D3_modal_inner.style('left'));

							top += d3.event.dy;
							left += d3.event.dx;

							D3_modal_inner.style('top', top+'px').style('left', left+'px');
							
						}
					})
					.on('dragstart', function(){
						var elements_to_not_drag = ['.form-row-input-container'],
								$dragging_element = $(d3.event.sourceEvent.explicitOriginalTarget);

						var can_drag = _.every(elements_to_not_drag, function(elementToDrag){
							if ($dragging_element.hasClass(elementToDrag.replace('.',''))){
								return false;
							} else if ($dragging_element.parents(elementToDrag).length > 0){
								return false;
							} else {
								return true;
							}
						});

						this.canDrag = can_drag;

					})

		d3.select($modal[0]).call(drag);

		return this;
	},

	initColorPicker: function(group){
		var that = this;
		this.$el.find('.color-picker').each(function(){
			var $colorPicker = $(this);
			$colorPicker.spectrum({
				preferredFormat: "hex",
				showPaletteOnly: true,
				hideAfterPaletteSelect: true,
				palette: that.palettes[group],
				change: function(color){
					// Save the hex back to the object for reading back laters
					$colorPicker.val(color.toHexString());
				}
			});
		});

		return this;
	},

	getVal: function(dataLocation){
		var f = $.serializeJSON,
				opts = f.setupOpts({}),
				location = dataLocation || this.valueKey || this.options.valueKey,
				value_keys = f.splitInputNameIntoKeysArray(dataLocation, opts),
				saved_data = this.model.toJSON();//,
		
		var type = value_keys.pop();
		// TODO, do something with type, perhaps
		var val = this.deepGet(saved_data, value_keys);

		return val;
	},

	deepGet: function(dataObj, keys, returnObjBool){
		dataObj = $.extend(true, {}, dataObj);
		// Protect against nested values on new item creation
		// This happens if we're looking for a value nested under a key that does not yet exist
		var val;
		if ( (_.isEmpty(dataObj) || !dataObj[keys[0]]) && keys.length > 1){
			val = {};
			val[keys[0]] = {};
		} else {
			val = dataObj[keys[0]];
		}

		// If we have specified any other values through a syntax of `key[nested_key][other_nested_key]`, then loop through them and replace the val
		_.chain(keys).rest().each(function(nextKey){
			val = val[nextKey];
		}, this).value();

		return val;
	},

	setVals: function(vals){
		vals = vals || [this.options.valueKey];

		var inputs_data = this.assembleInputsData(vals);

		inputs_data.forEach(function(inputData){
			var $input = inputData.$input;
			var val = inputData.val;

			var existing_value = $input.val() || '';

			if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
				$input.val(val);
			}

		}, this);


		return this;
	},

	revertToPreviousSettingVal: function(e){
		e.preventDefault();
		var $form = this.$form,
				previous_data = this.getRelevantSavedFormData(),
				that = this;

		this.model.set('data_changed', 'false');

		var set_actions = {
			normal: function($el, val){
				// Most elements like `input` tags and `select` tags can be set through `$el.val()`
				$el.val(val);
				return this;
			},
			color: function($el, val){
				// Our color picker is special, however
				$el.spectrum('set', val);
				return this;
			}
		};

		$form.find('input[type="text"],select').each(function(){
			var $input = $(this);
			var data_location = $input.attr('name');
			var val = that.getVal(data_location);

			var set_action = 'normal';
			if (data_location == 'color'){
				set_action = 'color';
			}
			set_actions[set_action]($input, val);

		});
			
		return this;
	},

	palettes: {
		'subject-tag': [
			['#1f78b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
			['#aec7e8','#ffbb78','#98df8a','#ff9896','#c5b0d5','#c49c94','#f7b6d2','#c7c7c7','#dbdb8d','#9edae5']
		],
		'impact-tag': [
			['#6699cc','#66cccc','#99cc99','#cc99cc','#d27b53','#f2777a','#f99157','#ffcc66','#bc80bd','#ccebc5','#ffed6f']
			// ['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
		]
	},

	assembleInputsData: function(keys){
		var input_data_object = keys.map(function(key){
			return {
				$input: this.$form.find('.js-input-item[name="'+key+'"]'),
				val: this.getVal(key)
			};
		}, this);

		return input_data_object;

	},

	saveModel: function(e){
		e.preventDefault();

		if (this.preSaveHook){
			this.preSaveHook();
		}

		var that = this;
		var attrs_to_save = this.getCurrentFormData(),
				existing_attrs;


		if (attrs_to_save.options){
			existing_attrs = _.pick(this.model.get('options'), function(option){
				// Only keep the truthy values, unless one is `0`, which is falsey but for our purposes is important
				var keep;
				if (option === 0){
					keep = true;
				} else {
					keep = option;
				}
				return keep;
			});
			attrs_to_save.options = _.extend(existing_attrs, attrs_to_save.options);
		}

		this.model.save(attrs_to_save, {
			patch: true,
			success: function(){
				that.modelSaved(true);
			},
			error: function(){
				that.modelSaved(false);
			}
		});

		return this;
	},

	modelSaved: function(saveSuccess){
		this.model.set('data_changed', !saveSuccess);

		if (saveSuccess){
			this.$form.attr('data-new', 'false');
			this.$el.removeClass('js-destroy-wait');
			if (this.postSaveHook){
				this.postSaveHook();
			}
			this.$form.addClass('js-just-saved').delay(1500)
																					.queue(function(next) { 
																							$(this).removeClass('js-just-saved');
																							next(); 
																					});


		}

		return this;

	},

	destroyModel: function(e){
		this.toggleModal(e);
		this.$el.addClass('js-destroy-wait');
		this.model.destroy({wait: true});
	},

	toggleModal: function(e){
		e.stopPropagation();
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	}


});


views.AA_BaseSettingListItemRecipe = views.AA_BaseSetting.extend({

	tagName: 'li',

	render: function(){
		var template = this.options.template || this.template;
		var parent_el = this.options.parentEl || this.parentEl;

		if (template){
			this.$el.html(template( {} ));
			if (parent_el){
				$(parent_el).append(this.el);
			}
		}

		return this;

	}, 
	
	checkIfNew: function(){
		if (!this.model){
			this.model = new models.recipe.Model(this.default_model_opts);
			collections.recipes.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	},

	preSaveHook: function(){
		// Add the homepage if it wasn't already on there
		// This happens on first account creation when they set the homepage and then create recipes which have been scaffolded
		var options = this.model.get('options');
		if (!options.search_query){
			options.search_query = pageData.org.homepage;
			this.model.set('options', options);
		}
	}

});
views.AA_BaseTag = Backbone.View.extend({

	whiteOrBlack: function(bgColorHex){
		var rgbColor = this.hexToRgb(bgColorHex);
		var r = rgbColor.r,
				g = rgbColor.g,
				b = rgbColor.b;
		var yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	},

	hexToRgb: function(hex){
		// break out
		if (hex === 'auto' || hex === 'transparent') {
			return hex;
		}
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		    return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},

	hexToRgbStr: function(hex){
		var hex_obj = this.hexToRgb(hex),
				rgb_str;
		if (hex_obj === hex){
			rgb_str = hex;
		} else {
			rgb_str = 'rgb('+[hex_obj.r, hex_obj.g, hex_obj.b].join(', ')+')';	
		}
		return rgb_str;
	},

	colorLuminance: function(hex, lum) {

		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	},

	styleLayout: function(){
		var bg_color = this.model.get('color'),
				text_color = this.whiteOrBlack(bg_color),
				bg_color_darker = this.colorLuminance(bg_color, -.25);

		// this.$el.css({'background-color': bg_color, 'color': text_color});
		this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

		return this;
	},

	styleLayoutWithTooltip: function(){
		this.styleLayout();

		var tooltip_text = this.getTooltipText();
		this.$el.addClass('tooltipped').attr('aria-label', tooltip_text);

		return this;
	},

	getTooltipText: function(){
		var category = this.model.get('category'),
				level = helpers.templates.prettyName(this.model.get('level')),
				tooltip_text = level + ' ' + category;

		return tooltip_text;
	}


});


views.AddArticle = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'addArticle'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.addArticleSchema` so we don't mess anything up
		var add_article_schema = _.clone(pageData.addArticleSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.event_schema = add_article_schema;
		this.form_info = {
			schema: add_article_schema,
			vals: {
				extract: true
			}
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Add an article');

		// The model that will be instantiated when we create a new one
		this.newModel = options.newModel

		// Bake the modal container and form elements
		this.render();
		// Disable the title searcher but init pikaday
		this.postRender({pikaday: true});
	},

	render: function(){
		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName] );
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	},

	refresh: function(){
		this.silenceAllSubviews();

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({pikaday: true});

		// Clear submit message
		this.flashSubmitMsg(false, 'Article processing!');

		return this;

	},

	addArticle: function(e){
		e.preventDefault();

		var self = this;

		var form_data = this.getSettings();

		var new_article_model = new this.newModel; 
		new_article_model.unset('active_selected');
		new_article_model.unset('selected_for_compare');
		new_article_model.unset('selected_for_detail');

    this.setProcessing(e, true)
		this.printMsgOnSubmit(false, '');

		this.validate(this.form_info.schema, form_data, function(err, msg){
			if (!err){
				self.toggleBtnsDisabled();

				// Use `collection.sync('create' ...` instead of `collection.create` because the latter also adds the model
				// Which will fire an update and add it to the dom but that isn't really what we want here because our dom is a
				// a result of filtering and such
				new_article_model.save(form_data, {
					wait: true,
					error: function(model, response, options){
						console.log('Server error on event edit', response);

						self.toggleBtnsDisabled();
						self.printMsgOnSubmit(true, 'Error '+response.status+': ' + response.responseText.replace(/\n/g, '<br/><br/>'));
				    self.setProcessing(e, false)
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						console.log(response)

						// Close the modal
						// self.toggleModal(e);
						self.refresh();
				    self.setProcessing(e, false)

					}
				});

			} else {
				self.printMsgOnSubmit(err, msg);
		    self.setProcessing(e, false)
			}

		}, this);

		return this;

	}
	// addArticle: function(e){
	// 	e.preventDefault();
	// 	// console.log(this.event_data);
		
	// 	var settings_obj = this.event_data;
	// 	var new_article_model = new models.new_article.Model;

	// 	delete settings_obj.undefined;

	// 	var required_keys = [
	// 		'created',
	// 		'url',
	// 		'title',
	// 		'authors'
	// 	];

	// 	this.validateNew(, function(error, description){
	// 		// Turn the authors field into an array of whitespace-trimmed strings
	// 		if (settings_obj.authors){
	// 			settings_obj.authors = settings_obj.authors.split(',').map(function(author){ return author.trim(); });
	// 		}
	// 		var that = this;
	// 		if (!error){
	// 			that.refresh({pikaday: true});
	// 			new_article_model.save(settings_obj, {
	// 				error: function(model, response, options){
	// 					console.log('Error in article creation', response);
	// 					that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
	// 				},
	// 				success: function(model, response, options){
	// 					console.log('Saved event', response);

	// 					views.helpers.toggleModal(e);
	// 					that.refresh({pikaday: true});
	// 				}
	// 			});
	// 		} else {
	// 			this.printMsgOnSubmit(error, description)
	// 		}

	// 	});


	// }

});
views.Alert = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper modal-parent',

	events: {
		'click .approval-btn-container[data-which="no"]': 'makeInsignificant',
		'click .approval-btn-container[data-which="yes"]': 'toggleModal',
		'submit form': 'createEvent'
		// 'change input': 'inputModified'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		this._subviews = [];
		this._time_picker;

		return this;

	},

	render: function() {
		var model_json = this.model.toJSON();
		var river_item_markup = templates.alertFactory( _.extend(model_json, helpers.templates) );
		this.$el.html(river_item_markup);

		this.$form = this.$el.find('form');

		this.postRender();

		return this;
	},

	postRender: function(){
		this.bakeEventCreator();

		return this;
	},

	bakeEventCreator: function(){

		var event_creator_view = new views.EventCreatorFromAlert({el: this.el, model: this.model.toJSON()});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view._time_picker;
		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;

	},

	toggleModal: function(e){
		var $modalOuter = $(e.currentTarget).parents('.modal-parent').find('.modal-outer'),
				modal_opening = $modalOuter.css('display') == 'none';
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
		// Set the focus to the headline field on modal toggle open
		// TODO, could possibly be abstracted into a setting in the form, like, `put-focus`.
		if (modal_opening){
			$modalOuter.find('input[name="assignees-selector"]').focus();
		}
	},

	createEvent: function(e){
		e.preventDefault();

		var self = this; // `this` is the `alert` view

		var event_creator_view = this.event_creator_view,
		    form_data = event_creator_view.getSettings(),
		    form_info = event_creator_view.form_info;

    event_creator_view.setProcessing(e, true)
		event_creator_view.printMsgOnSubmit(false, '');

		this.event_creator_view.validate(form_info.schema, form_data, function(err, msg){
			if (!err){
				self.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on recipe edit', response);
						event_creator_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
				    recipe_editor_view.setProcessing(e, false)
					},
					success: function(model, response, options){
						console.log('Saved event', response);
						views.helpers.toggleModal(e);
						self.removeItem('save');
				    recipe_editor_view.setProcessing(e, false)
					}
				});
			} else {
				event_creator_view.printMsgOnSubmit(err, msg);
		    event_creator_view.setProcessing(e, false)
			}

		}, this);


		return this;

	},

	makeInsignificant: function(itemModel){
		var self = this;
		// When we destroy it, it removes it from the collection
		// Firing the remove event we have set up for page switching
		// We want to override that so it does our fade out
		// So set this additional bool as a gate
		// And check for it on destroy
		this.model.set('making_insignificant', true);
		// TODO, replace alert if fails
		self.removeItem('delete');
		this.model.destroy({
			// wait: true,
    	success: function(model, response) {

			},
			error: function(error){
				console.log('Error deleting event.', error);
			}
		});
	},

	removeItem: function(mode){
		// Open up a modal that lets you assign it to something
		this.model.set('destroy', mode);
	},

	destroy: function(model, destroyMode){
		var making_insignificant = model.get('making_insignificant');
		// For now just destroy
		if (destroyMode == 'remove' && !making_insignificant){
			// this._time_picker.destroy();
			this.killView();
		} else if (destroyMode == 'delete'){
			this.removeAlertColorfully('delete')
		} else if (destroyMode == 'save') {
			this.removeAlertColorfully('save')
		}
	},

	removeAlertColorfully: function(mode){
		var self = this,
				animation_duration = 500,
				color,
				height;
				
		if (mode == 'save'){
			color = '#D0F1D1';
		} else if (mode == 'delete'){
			color = '#FFD0D0';
		}

		var height = this.$el.css('height') + 10;

		var animation_opts = {
			'width': 0,
			'opacity': 0,
			'margin-top': 0,
			'margin-right': 0,
			'height': 0,
			'margin-bottom': height
		};

		if ($(window).width() > 1260){
			animation_opts['padding-left'] = 0;
			animation_opts['padding-right'] = 0;
		} else {
			animation_opts['padding-bottom'] = 0;
			animation_opts['margin-bottom'] = 0;
		}

		this.$el.css({
				'background-color': color,
				'overflow': 'hidden',
				'white-space': 'nowrap'
			}).animate(animation_opts, animation_duration)
			.delay(0)
			.queue(function(next) { 
				onAnimationEnd.call(self);
			});

		function onAnimationEnd(){
			this.event_creator_view._time_picker.destroy();
			this.killView();
		}
	}

});
views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){

		this.sortAscending = collections.article_comparisons.instance.metadata('sort_ascending');
		this.listenTo(collections.article_comparisons.instance, 'sortMetricHeaders', this.sortBy);
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.setMetricHeaders);
		
		// Cache our comparison parameters
		this.calcComparisonMarkerParams();

		this.metric_comparisons = this.addComparisonInfo();

		return this;
	},

	render: function(){
		var select_dimensions = _.extend({
				selects: this.collection.metadata('selects')
			}, 
			helpers.templates.articles
		);
		var grid_markup = templates.articleGridContainerFactory( select_dimensions );

		this.$el.html(grid_markup);
		this.setMetricHeaders();
		
		return this;
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // mean
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // all
		this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('max'); // per_97_5
		return this;
	},

	getComparisonGroup: function() {
		var group = this.comparison_marker_group
		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object_list;
		if (group == 'all'){
			comparison_object_list = models.comparison_metrics.get(group);
		} else {
			comparison_object_list = models.comparison_metrics.get('subject_tags')[group];
		}
		return comparison_object_list
	},

	addComparisonInfo: function(){
		var metrics_list = this.collection.cloneMetrics();

		var full_group_comparison_metrics = this.getComparisonGroup()

		metrics_list.forEach(function(metricInfo){
			var comparison_data = _.findWhere(full_group_comparison_metrics, {metric: metricInfo.name}) || {};
			_.extend(metricInfo, comparison_data);
		});

		return metrics_list;
	},

	sortColumn: function(e){
		var $this = $(e.currentTarget);

		// Only if we're clicking on an active header, reverse the sort order
		if ($this.hasClass('active')) {
			this.sortAscending = !this.sortAscending;
		}

		// Sorting
		var dimension_name = $this.attr('data-metric');

		// Stash our sorting options to be used on relayout
		collections.article_comparisons.instance.metadata('sort_ascending', this.sortAscending);
		collections.article_comparisons.instance.metadata('sort_by', dimension_name);
		collections.article_comparisons.instance.trigger('sortMetricHeaders');

		// this.sortBy(metric);

		return this;

	},

	// This function needs to be refactored to work off of a model change and not a UI click
	// It should get all values from the article_comparisons collection
	sortBy: function(){

		var self = this;

		var dimension_name = collections.article_comparisons.instance.metadata('sort_by');
		var sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');

		// console.log(dimension_name)
		// console.log(sort_ascending)
		// Give active class to this header
		$('.header-el').removeClass('active');
		// TODO, standardize these data attribute names to `data-dimension`
		$('.header-el[data-metric="'+dimension_name+'"]').addClass('active');
		$('.header-el').attr('data-sort-ascending', sort_ascending);

		app.instance.$isotopeCntnr.isotope({ sortBy : dimension_name, sortAscending: sort_ascending });

		collections.article_comparisons.instance.setComparator(dimension_name);

		// Force a sort in this new order since `sort` is only called when adding models
		collections.article_comparisons.instance.sort();

		app.instance.saveHash();
	},

	setMetricHeaders: function(){
		// These were just changed so grab them again
		this.calcComparisonMarkerParams();
		// Get our new comparison group data
		this.metric_comparisons = this.addComparisonInfo();

		var operation = this.comparison_marker_operation,
				group     = this.comparison_marker_group,
				display_operation = operation,
				display_operation_abbreve = display_operation;

		// Each quant metric corresponds to a column header, whose html and aria-label we want to set
		this.metric_comparisons.forEach(function(metricInfo){
			var metric_name = metricInfo.name,
					$header_el = this.$el.find('.header-el[data-metric="'+metric_name+'"] .comparison-figure'),
					value = metricInfo[operation];

			if (typeof value == 'number'){
				value = helpers.templates.addCommas(value);
			} else {
				console.log('WARNING: Could not find comparison value for: ', metric_name, 'For operation:', operation ,'In group:', group);
			}

			if (operation == 'mean') {
				display_operation = 'average';
				display_operation_abbreve = 'avg';
			}

			// If the group name is a number, it's a subject tag and the name needs fetching
			var group_name
			var tag_model
			if (group != 'all') {
				tag_model = collections.subject_tags.instance.findWhere({'id': +group})
				if (tag_model) {
					group_name = tag_model.get('name')
				}
			}
			group_name = group_name || group

			display_operation = helpers.templates.toTitleCase(display_operation);
			display_operation_abbreve = helpers.templates.toTitleCase(display_operation_abbreve);

			var markup = '<span class="comparison-figure-operation">' + display_operation_abbreve + ': </span><span class="comparison-figure-value">' + value + '</span>';

			$header_el.html(markup).attr('aria-label', display_operation + ' of ' + group_name + ' articles.');
		}, this);
	}
})

views.ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		'click .tab': 'setActiveTabFromClick',
		'click .modal-toggle': 'toggleModal', // Define this here because we have a few different views like event creators
		'click .modal-parent[data-which="subject"] .modal-close': 'toggleModal',
		'click .load-more': 'moreEvents',
		'click #download-data[href="#"]': 'setDownloadButton'
	},

	initialize: function(){

		// Keep track of all views this view creates
		this._subviews = [];
		this.listenTo(this.model, 'destroyDetail', this.destroyView);

		// This will populate from a fetch
		this.article_detailed_events_collection = new collections.article_detailed_events.Collection();
		this.event_filters = new models.filters.Model({sort_by: 'created'}); // Hardcode this for now until we figure out the UI for sorting events

		// This will also populate from a fetch
		this.article_detailed_timeseries = new collections.article_detailed_timeseries.Collection();
		this.article_detailed_timeseries.setUrl(this.model.id);

		// This will also populate from a fetch
		this.article_detailed_tweets = new collections.article_detailed_tweets.Collection();
		this.article_detailed_tweets.setUrl(this.model.id);

		// Listen to changes on it and add / remove events accordingly
		this.listenTo(this.article_detailed_events_collection, 'add', this.eventsGallery.add);
		this.listenTo(this.article_detailed_events_collection, 'remove', this.eventsGallery.remove);
		this.listenTo(this.article_detailed_events_collection, 'error', this.reportErr);

		// Just listen to errors on it for now
		this.listenTo(this.article_detailed_timeseries, 'error', this.reportErr);
		this.listenTo(this.article_detailed_tweets, 'error', this.reportErr);

		/* Tag baking */
		// Listen for adding things from the page and bake them
		this.listenTo(collections.article_detailed_subject_tags.instance, 'add', this.subject_tags.add);
		this.listenTo(collections.article_detailed_subject_tags.instance, 'remove', this.subject_tags.remove);
		this.listenTo(collections.article_detailed_subject_tags.instance, 'error', this.reportErr);

		// Do the same thing for impact tags
		this.listenTo(collections.article_detailed_impact_tags.instance, 'add', this.impact_tags.add);
		this.listenTo(collections.article_detailed_impact_tags.instance, 'remove', this.impact_tags.remove);

		// And impact categories
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'add', this.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'remove', this.impact_tag_attribute.remove);

		// And levels
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'add', this.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'remove', this.impact_tag_attribute.remove);
		/* end tag baking */

		/* Setup event filtering */

		// Add them to a collection so we can more easily filter and figure out adding and removing of elements
		var fetchEventsByParameters_debounced = _.debounce(this.fetchEventsByParameters, 5);
		this.listenTo(this.event_filters, 'hasChanged', fetchEventsByParameters_debounced);

		models.event_tag_facets = new models.generic.Model({});
		this.listenTo(models.event_tag_facets, 'change', this.updateTagContainerByCounts);
		this.articles_impact_tags_collection 						= new collections.impact_tags.Collection(this.model.get('impact_tags_full'));
		this.articles_impact_tag_categories_collection	= new collections.impact_tag_attributes.Collection(this.model.get('impact_tag_categories'));
		this.articles_impact_tag_levels_collection			= new collections.impact_tag_attributes.Collection(this.model.get('impact_tag_levels'));

		// Set this metadata for how it gets its counts and for how it will add its values for filtering by api call
		this.articles_impact_tags_collection.metadata('filter', 'impact_tag_ids');
		this.articles_impact_tag_categories_collection.metadata('filter', 'categories');
		this.articles_impact_tag_levels_collection.metadata('filter', 'levels');

		/* end event filtering */


		/* Setup Spotted Tail */
		this.chartSelector = '#ST-chart';

		this.legend =	{
			facebook_shares: {service: 'Facebook', metric: 'shares', color: '#3B5998', group: 'a'},
			twitter_shares: {service: 'Twitter', metric: 'shares', color: '#55ACEE', group: 'a'},
			ga_pageviews: {service: '', metric: 'pageviews', color: '#FF7F0E', group: 'b'}
		};

		// Throttle this for onBrush callback
		this.filterEventsByDateRange_throttled = _.throttle(this.filterEventsByDateRange, 100);


		// Throttle resize
		this.onWindowResize_throttled = _.throttle(this.onWindowResize, 200);

		var self = this;
		$( window ).resize(function() {
			self.onWindowResize_throttled.call(self);;
		});

	},

	render: function(){
		var model_json = this.model.toJSON();
		var article_detail_markup = templates.articleDetailFactory( _.extend(model_json, helpers.templates) );
		this.$el.html(article_detail_markup);
		// console.log(model_json);

		return this;
	},

	reportErr: function(model, msg){
		var response;
		if (msg.responseJSON){
			response = msg.responseJSON;
		} else {
			response = msg;
		}
		console.log('ERROR in model:',model);
		console.log('ERROR message:', response);
		alert(response.error  +' ' + response.status_code + ': ' + response.message);
	},

	setLoading: function($target, state){
		$target.attr('data-loading', state);
		return this;
	},

	bakeInteractiveBits: function(){
		var self = this;
		// Event creator element
		this.$eventCreator = $('#event-creator-container');
		// Tag elements
		this.$subjectTagsContainer         = this.$el.find('.article-info-container[data-which="subject"] > ul.tags');
		this.$impactTagsContainer          = this.$el.find('.article-info-container[data-which="impact"] ul.tags');
		this.$impactTagCategoriesContainer = this.$el.find('.article-info-container[data-which="impact-categories"] ul.tags');
		this.$impactTagLevelsContainer     = this.$el.find('.article-info-container[data-which="impact-levels"] ul.tags');

		// Bake all of this newsroom's subject tags under the edit subject tags option
		this.$editSubjectTagsContainer     = this.$el.find('#subject-tag-settings');

		// The filer options for the events gallery
		this.$impactTagsList = this.$el.find('.option-container[data-type="impact-tags"] .tag-list');
		this.$impactTagCategoriesList = this.$el.find('.option-container[data-type="categories"] .tag-list');
		this.$impactTagLevelsList = this.$el.find('.option-container[data-type="levels"] .tag-list');

		// Stash these to iterate through them to update counts
		// This could be better handled if the tag container had its own view but it doesn't for now
		this.tag_list_els = {
			tags: this.$impactTagsList.parent(),
			categories: this.$impactTagCategoriesList.parent(),
			levels: this.$impactTagLevelsList.parent()
		};

		// Events container
		this.$eventsContainer = this.$el.find('#events-container');
		this.$eventsGalleryContainer = this.$el.find('#events-gallery-container');

		this.$downloadData = this.$el.find('#download-data');

		// Do some great async flow
		this.article_detailed_timeseries.fetch({
				data: {
					transform: 'cumulative' // TODO, make this configurable in
				}
			})
			.then(function(models, status, response){
				
				// Get our events gallery items
				// Don't increment, this is the first run
				self.fetchEventsByParameters(false, true, function(){

					$(self.chartSelector).attr('data-loading', 'false')

					var events_data = self.article_detailed_events_collection.toJSON();

					self.spottedTail = spottedTail()
						.timezone(pageData.timezone)
						.y(function(d) { return +d.count; })
						.legend(self.legend)
						.events(events_data)
						.interpolate('step-after')
						.onBrush(_.noop);

					self.bakeChart(self.article_detailed_timeseries.toJSON());
				});

			});

		this.article_detailed_tweets.fetch()
			.then(function(models, status, response){
				self.bakeTweetz();
			});

		// What are we doin? 
		this.bakeTags();
		this.bakeEventCreator();
		this.bakeArticleVizs();
		// Bake some navigation
		this.setDetailNavigation();
		this.calcStickyOffsets();
		// Which tab is viewing
		this.setActiveTab();

		return this;
	},

	bakeEventGalleryFurniture: function(){
		// Remove placeholder info and set state 
		this.$eventsContainer.find('.placeholder').remove();
		this.bakeEventsGalleryFilters();
		// this.setLoading(this.$eventsContainer, 'false');
		// this.setLoadMoreEventsButton();
	},

	setDownloadButton: function(e){
		e.preventDefault(); 
		var $btnContainer = $(e.currentTarget),
				$downloadBtn = $btnContainer.find('button');

		$btnContainer.addClass('disabled').addClass('loading-spinner');
		$downloadBtn.html('Fetching...');

		var model_json = this.model.toJSON(),
				self = this;

		// console.log(model_json)

		var csvs = {};
	  var now = helpers.common.toUserTimezone(new Date());

		var timestamp = now.format('YYYY-MM-DDTHH-mm');

		var csv_schemas = {}
		// csv data sources
		// For our schemas, some pull from the article data, others from events data
		var csv_data_sources = {};
	
		// Comparisons csv
		// console.log(flattenObj(models.comparison_metrics.toJSON()))
		csvs[timestamp+'_article_'+this.model.id+'_comparisons'] = flattenComparisons(models.comparison_metrics.toJSON(), model_json.metrics, model_json.id).map(addExportedDate);

		// Subject tag csv
		csvs[timestamp+'_article_'+this.model.id+'_subject_tags'] = model_json.subject_tags_full.map(addExportedDate)
		// Impact tag csv
		csvs[timestamp+'_article_'+this.model.id+'_impact_tags'] = model_json.impact_tags_full.map(addExportedDate)

		function flattenComparisons(comparisonObj, modelMetrics, modelId) {
			// console.log(comparisonObj)

			var comparison_csv = []

			_.each(comparisonObj, function(subGroup, groupName){
				// console.log(subGroup)
				// The `all` comparison object is an array, the others are dictionaries of sub groups
				var metric_row_shell = {
					content_item_id: modelId
				}
				var metric_group;
				if (_.isArray(subGroup)){
					_.extend({
						group: groupName,
						subGroup: 'all'
					}, metric_row_shell);
					metric_group = subGroup.map(function(metricRow){
						return _.extend({}, metric_row_shell, {article_value: modelMetrics[metricRow.metric]}, metricRow)
					})
					comparison_csv = comparison_csv.concat(metric_group);
				} else {
					_.each(subGroup, function(metricsList, subGroupName){
						_.extend({
							group: groupName,
							subGroup: subGroupName
						}, metric_row_shell)
						// console.log(groupName, subGroupName, metricsList)
						metric_group = metricsList.map(function(metricRow){
							return _.extend({article_value: modelMetrics[metricRow.metric]}, metric_row_shell, metricRow)
						})
						comparison_csv = comparison_csv.concat(metric_group);
					});

				}
			});

			return comparison_csv;

		};

		function addExportedDate(objToAugment){
			var augmented_obj = {}
			augmented_obj.exported_date = now.format()
			_.extend(augmented_obj, objToAugment);
			return augmented_obj;
		}

		models.exports.fetch({
				data: {
					content_item_ids: this.model.id,
					timestamp: timestamp,
					now: now.format(),
					tags: pageData.tags
				}
			})
			.then(function(csvResponse, status, response){

				_.extend(csvs, csvResponse)

				try {
					console.log(csvs)
					zip.zipMultiple(csvs, 'csv', function(zippedBlob, zippedBlobHref){
						$btnContainer.removeClass('disabled');
						$downloadBtn.html('Click to download!');
						self.$downloadData.attr('href', zippedBlobHref);
					});
				} catch(err){ 
					console.log(err)
					alert(err)
				}
					
				// } catch(err){
				// 	self.$downloadData.hide();
				// 	alert('Sorry. This article\'s data couldn\'t be prepped for download.\nPlease email me with the article URL and I\'ll get Michael and Brian to fix it: merlynne@newslynx.org.\n\nEverything else should be working fine.');
				// 	console.log(model_json);
				// 	console.log(flat_dict);
				// }

			})

	},

	bakeChart: function(timeseriesData){
		d3.select(this.chartSelector)
			.datum(timeseriesData)
			.call(this.spottedTail);

		return this;

	},

	calcStickyOffsets: function(){
		// Save the offset of the sticky element
		var $sticky = this.$el.find('.sticky'),
				$sticky_anchor = this.$el.find('.sticky-anchor'),
				sticky_anchor_offset;

		if ($sticky.length && $sticky_anchor.length) {
			sticky_anchor_offset = $sticky_anchor.position().top + $('#content').scrollTop();
			$sticky.attr('data-offset', sticky_anchor_offset);
		}

		return this;
	},

	onWindowResize: function(){
		this.calcStickyOffsets();
	},

	bakeEventsGalleryFilters: function(){
		// Impact tags
		if (this.articles_impact_tags_collection.length){
			this.$impactTagsList.html('');
			this.articles_impact_tags_collection.each(function(tagModel){
				var tag_view = new views.TagEventFilter({ model: tagModel, filterModel: this.event_filters });
				// Keep track of this subview so self we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagsList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (this.articles_impact_tag_categories_collection.length){
			this.articles_impact_tag_categories_collection.each(function(tagModel){
				this.$impactTagCategoriesList.html('');
				var tag_view = new views.TagEventFilter({ model: tagModel, filterModel: this.event_filters });
				// Keep track of this subview so self we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (this.articles_impact_tag_levels_collection.length){
			this.articles_impact_tag_levels_collection.each(function(tagModel){
				this.$impactTagLevelsList.html('');
				var tag_view = new views.TagEventFilter({ model: tagModel, filterModel: this.event_filters });
				// Keep track of this subview so self we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		return this;
	},

	bakeArticleVizs: function(){

		var $articleVizsReadingContainer = this.$el.find('section.detail-section[data-group="reading"]');
		var ga_metrics = this.model.getGaMetrics();
		// var tweet_info = this.model.get('tweet_info');

		// Only bake these if we have referrer data
		if (!_.isEmpty(ga_metrics)){
			$articleVizsReadingContainer.html('');
			// /* DEVICE FACET */
			var device_facet_view = new views.ArticleDetailVizDeviceFacet({
				title: 'On which devices are people reading?', 
				ga_metrics: ga_metrics,
				which: 'device'
			});
			this._subviews.push(device_facet_view);
			var device_facet_markup = device_facet_view.render('marker-also').el;
			$articleVizsReadingContainer.append(device_facet_markup);
			/* end device facet */

			/* INTERNAL/EXTERNAL */
			var internal_external_facet_view = new views.ArticleDetailVizInternalExternal({
				title: 'Is traffic internally or externally driven?', 
				ga_metrics: ga_metrics,
				which: 'internal-external'
			});
			this._subviews.push(internal_external_facet_view);
			var internal_external_facet_markup = internal_external_facet_view.render('marker-also').el;
			$articleVizsReadingContainer.append(internal_external_facet_markup);
			/* end device facet */

			/* DOMAIN REFERRERS */
			var domain_facet_view = new views.ArticleDetailVizDomainFacets({
				title: 'Who\'s sending readers here?', 
				ga_metrics: ga_metrics,
				which: 'domain-referrers'
			});
			this._subviews.push(domain_facet_view);
			var domain_facet_markup = domain_facet_view.render().el;
			$articleVizsReadingContainer.append(domain_facet_markup);
			/* end device facet */


			/* ARTICLE REFERRERS */
			var domain_facet_view = new views.ArticleDetailVizArticleReferrers({
				title: 'What articles link here?', 
				ga_metrics: ga_metrics,
				which: 'article-referrers'
			});
			this._subviews.push(domain_facet_view);
			var domain_facet_markup = domain_facet_view.render().el;
			$articleVizsReadingContainer.append(domain_facet_markup);
			/* end article referrers */

		}

		return this;
	},

	bakeTweetz: function(){
		var tweets = this.article_detailed_tweets.toJSON(),
				$articleVizsTweetsContainer = this.$el.find('section.detail-section[data-group="tweeting"]');

		/* TWEEETZ */
		if (!_.isEmpty(tweets)){
			$articleVizsTweetsContainer.html('');
			var tweets_view = new views.ArticleDetailVizTweets({
				title: 'Who\'s tweeted this story?', 
				tweets: tweets,
				which: 'tweets'
			});
			this._subviews.push(tweets_view);
			var tweet_markup = tweets_view.render().el;
			$articleVizsTweetsContainer.append(tweet_markup);
			/* end tweetz */
			
		}

		return this;
	},

	eventsGallery: {
		add: function(eventModel){
			var item_view,
					item_el;

			eventModel.set('in_selection', true);
			item_view = new views.ArticleDetailEvent({model: eventModel});
			// Keep track of this subview so self we might destroy it later!
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$eventsGalleryContainer.append(item_el);
			return this;
		},
		remove: function(eventModel){
			eventModel.set('in_selection', false);
			return this;
		},
		setActiveEvents: function(){
			var current_filtered_set = views.po.article_detailed_events.getCurrentItems();

			// // To maintain the correct sort order on the dom, we want to empty it
			this.article_detailed_events_collection.set([]);
			// // For changing the drawer list items based on filters
			this.article_detailed_events_collection.set(current_filtered_set);
		}
	},

	updateEventGalleryItems: function(){
		return this;
	},

	bakeTags: function(){
		// Append some things after the HTML has been baked
		// Such as tags
		var local_subject_tags_collection;

		// Set up the other collections and page elements
		// Populate tags into the subject_tag
		var subject_tags_full     		= this.model.get('subject_tags_full');
		var subject_tag_input_options = this.model.get('subject_tag_input_options');
		var impact_tags_full      		= this.model.get('impact_tags_full');
		var impact_tag_categories 		= this.model.get('impact_tag_categories');
		var impact_tag_levels     		= this.model.get('impact_tag_levels');

		// If we have subject tags, clear our placeholder 'No tags' and add the real tags
		if (subject_tags_full.length){
			this.$subjectTagsContainer.html('');
			collections.article_detailed_subject_tags.instance.set(subject_tags_full);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_subject_tags.instance.set([]);
		}

		// Impact tag categories
		if (impact_tags_full.length){
			this.$impactTagsContainer.html('');
			collections.article_detailed_impact_tags.instance.set(impact_tags_full);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tags.instance.set([]);
		}


		// Impact tag categories
		if (impact_tag_categories.length){
			this.$impactTagCategoriesContainer.html('');
			collections.article_detailed_impact_tag_attributes.categories_instance.set(impact_tag_categories);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.categories_instance.set([]);
		}

		// Impact tag levels
		if (impact_tag_levels.length){
			this.$impactTagLevelsContainer.html('');
			collections.article_detailed_impact_tag_attributes.levels_instance.set(impact_tag_levels);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.levels_instance.set([]);
		}


		// Add all account subject tags to the maker modal
		if (collections.subject_tags.instance.length){
			this.$editSubjectTagsContainer.html('<div class="description">Add subject tags to this article.</div>');

			// Make a copy for every article
			// collections.subject_tags.instance.each(function(subjectTagModel){
			subject_tag_input_options.forEach(function(subjectTagModel){
				var subject_tag_view,
						subject_tag_el;

				subject_tag_view = new views.ArticleDetailSubjectTagEditor({model: subjectTagModel, articleTags: subject_tags_full});
				// Keep track of this subview so self we might destroy it later!
				this._subviews.push(subject_tag_view);
				subject_tag_el = subject_tag_view.render().el;
				this.$editSubjectTagsContainer.append(subject_tag_el);
			// }, this);

			}, this);

			// Init dragging on this modal
			var editSubjectTagsWrapper = this.$el.find('#add-subject-tag').parents('.modal-parent').find('.modal-inner')[0];
			d3.select(editSubjectTagsWrapper).call(this.drag());

		}
	},

	subject_tags: {
		add: function(subjectTagModel){
			var item_view,
					item_el;

			// If this article didn't have any before
			if (collections.article_detailed_subject_tags.instance.length == 1){
				this.$subjectTagsContainer.html('');
			}
			item_view = new views.ArticleDetailSubjectTag({model: subjectTagModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$subjectTagsContainer.append(item_el);
			return this;
		},
		remove: function(subjectTagModel){
			// console.log('removing')
			// this.killView();
			if (collections.article_detailed_subject_tags.instance.length == 0){
				this.$subjectTagsContainer.append('<li class="tag empty">None</li>');
			}
			subjectTagModel.trigger('destroy');
			// subjectTagModel.set('destroy', true);
			return this;
		}
	},	
	impact_tags: {
		add: function(impactTagModel){
			var item_view,
					item_el;
			item_view = new views.ArticleDetailImpactTag({model: impactTagModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$impactTagsContainer.append(item_el);
			return this;
		},
		remove: function(subjectTagModel){
			// console.log('removing')
			// this.killView();
			subjectTagModel.set('destroy', true);
			return this;
		}
	},
	impact_tag_attribute: {
		add: function(attributeModel, collection){
			var item_view,
					item_el;
			// This will tell us if we should append to the `category` or `level` list
			var which_collection = collection.metadata('which'),
					containers = {
						categories: this.$impactTagCategoriesContainer,
						levels: this.$impactTagLevelsContainer    
					},
					container = containers[which_collection];

			item_view = new views.ArticleDetailAttributeTag({model: attributeModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			container.append(item_el);
			return this;
		},
		remove: function(){

		}
	},

	bakeEventCreator: function(){
		// We will pass the assignee into the event creator view so it can set self field
		var defaults = {
			status: 'approved',
			content_items: [{
				id: this.model.id,
				title: this.model.get('title')
			}]
		};

		// Create an instance of an event creator view
		var event_creator_view = new views.EventCreator({el: this.$eventCreator[0], model: defaults, collection: this.article_detailed_events_collection, saveMsg: 'Event saved!'});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view._time_picker;
		return this;
	},

	filterEventsByDateRange: function(timestampRange, empty){
		// Reconvert out of user timezone and set to timestamp
		collections.po.article_detailed_events.filters.timestamp.clearQuery();
		// The second argument tells us whether our brush is empty, only filter it if we are actively filtering, aka, not empty
		// This protects against the situation where the date of an event is outside the range of the graph
		// Clicking off the graph filter will set your filter to its extents, which may not be the extends of your events
		if (!empty){
			collections.po.article_detailed_events.filters.timestamp.intersectQuery(timestampRange)
		}
	},

	setActiveTab: function(){
		var group = collections.article_detailed.instance.metadata('selected-tab');

		var $tab 		= this.$el.find('.tab[data-group="'+group+'"]'),
				$target = $('.detail-section[data-group="'+group+'"]');
		// Update style on this tab
		this.$el.find('.tab').removeClass('active');
		$tab.addClass('active');

		// Hide other section
		$('.detail-section').hide();
		// Show the section we want
		$target.show();

		return this;
	},

	setActiveTabFromClick: function(e){
		var $tab = $(e.currentTarget),
				group;

		// Only proceed if there is no active class
		if (!$tab.hasClass('active')){
			group   = $tab.attr('data-group');
			collections.article_detailed.instance.metadata('selected-tab', group);
			this.setActiveTab();
		}
		return this;
	},

	setDetailNavigation: function(){
		var comparison_models = app.instance.staged_article_comparison_models,
				comparison_ids = _.pluck(comparison_models, 'id'),
				this_id = this.model.id,
				this_id_index = comparison_ids.indexOf(this_id),
				$nav = this.$el.find('.article-detail-navigation'),
				$prev = $nav.find('.prev'),
				$next = $nav.find('.next'),
				$spacer = $nav.find('.spacer'),
				prev_model_index = this_id_index - 1,
				next_model_index = this_id_index + 1,
				prev_model,
				next_model,
				prev_title,
				next_title;

		if (this_id_index != -1) {
			// If it's not the first one, print a previous
			if (this_id_index > 0) {
				prev_model = comparison_models[prev_model_index];
				prev_title = helpers.templates.htmlDecode(prev_model.get('title'));

				$prev.html(' Prev')
					.addClass('go-to-detail')
					.attr('data-id',  prev_model.get('id'))
					.attr('aria-label', prev_title)
					.prepend('<span class="octicon octicon-chevron-left"></span>')
			}

			// If it's not the last one print a next
			if (this_id_index < comparison_ids.length - 1) {
				next_model = comparison_models[next_model_index];
				next_title = helpers.templates.htmlDecode(next_model.get('title'));

				$next.html('Next ')
					.addClass('go-to-detail')
					.attr('data-id', next_model.get('id'))
					.attr('aria-label', next_title)
					.append('<span class="octicon octicon-chevron-right"></span>')

			}

		}

	},

	toggleModal: function(e){
		// Open up a modal self lets you assign it to something
		views.helpers.toggleModal(e);
	},

	destroyView: function(model){
		// this._time_picker.destroy();
		this.killView();
	},

	drag: function(){
		return d3.behavior.drag()
					.on("drag", function(d,i) {
						var D3_modal_inner = d3.select(this),
								top = parseInt(D3_modal_inner.style('top')),
								left = parseInt(D3_modal_inner.style('left'));

						top += d3.event.dy;
						left += d3.event.dx;

						D3_modal_inner.style('top', top+'px').style('left', left+'px');
							
					})
	},

	// clearLoadMoreButton: function(){
	// 	this.$eventsGalleryContainer

	// 	return this;
	// },

	moreEvents: function(e){
		app.helpers.gifizeLoadMoreButton($(e.currentTarget));

		this.fetchEventsByParameters(true);

		return this;
	},

	setLoadMoreEventsButton: function(){

		// Set up what collection we want to follow
		var this_collection = this.article_detailed_events_collection,
				$list = this.$eventsGalleryContainer,
				$loadMoreBtn; // To be created and appended below, if we need it.

		// Always kill the button
		// this.clearLoadMoreButton();
		$list.find('.load-more').remove();

		var pagination_info = this_collection.metadata('pagination');
		var current_page = pagination_info.page,
				page_size = pagination_info.per_page,
				total_pages = pagination_info.total_pages;

		var currently_loaded_count = this_collection.length,
				total_pending_for_search = this_collection.metadata('total');

		// Do we need the button
		var more_alerts_to_load = current_page < total_pages,
				remaining_alerts = total_pending_for_search - currently_loaded_count,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				button_str;

		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMoreBtn = $('<button class="load-more"></button>');
			button_str = 'Showing ' + currently_loaded_count + ' out of ' + total_pending_for_search + '. Load ' + to_load_string + ' more...'

			// Finally, append it as the last thing
			$loadMoreBtn.html(button_str).appendTo($list);

		}

		return this;

	},

	fetchEventsByParameters: function(increment, firstRun, cb){
		var self = this;
		var params = this.event_filters.assembleQueryParams();
		params.content_item_ids = this.model.id;

		var this_collection = this.article_detailed_events_collection;
		var collection_pagination = this_collection.metadata('pagination') || {};
		var current_page = collection_pagination.page;

		this.toggleFilterBtns();
		// console.log('params',params);


		// This is the initial loading state
		if (increment){
			params.page = current_page + 1;
		} else {
			// Set the loading state
			self.setLoading.call(self, self.$eventsContainer, true);
			// Also call this on the content div so we can freeze scrolling to avoid a jump when the container goes empty
			// app.instance.setLoading.call(app.instance, app.instance.$content, true);
			// // Clear the set
			this_collection.set([]);
		}
		// // Responsive articles will be added to `this_collection`
		// // `pagination and `total` information will be added as metadata on that collection
		this_collection.fetch({data: params, remove: false})
			.then(function(model, status, response){
				// This is only called on success, error are caught by our listener above
				if (firstRun){
					self.bakeEventGalleryFurniture();
					// self.setDownloadButton();

				}
				self.setLoading.call(self, self.$eventsContainer, 'false');
				// app.instance.setLoading.call(app.instance, app.instance.$content, 'false');
				self.setLoadMoreEventsButton.call(self);

				if (cb) {
					cb();
				}

			});

		return this;
	},

	updateTagContainerByCounts: function(){

		_.each(this.tag_list_els, function($el, key){
			var facet = models.event_tag_facets.get(key);
			$el.find('.count').html(facet.length);
			var has_facet = facet.length > 0;
			$el.toggleClass('disabled', !has_facet);

		}, this);

		return this;
	},

	toggleFilterBtns: function(){
		_.each(this.tag_list_els, function($el, key){
			var $clearBtn = $el.find('.clear');
			// Do some massaging based on what our `data-type` and what the key under `models.content_item_filters` is
			// They differ bc the filter keys are what the api expects. 
			// TODO, This is a candidate for refactoring now that the API is stable
			if (key === 'tags'){
				key = 'tag_ids';
			}
			var group_active = this.event_filters.metadata(key);
			app.instance.toggleFilterBtn($clearBtn, group_active);
		}, this);
		return this;
	}
});

views.ArticleDetailAttributeTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	// events: {
	// 	'click': 'remove'
	// },

	initialize: function(){
		// Set colors
		this.styleLayout();
		return this;
	},

	render: function(){
		// console.log('model',this.model.toJSON())
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);
		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	}

	// styleLayout: function(){
	// 	var bg_color = this.model.get('color'),
	// 			text_color = this.whiteOrBlack(bg_color),
	// 			bg_color_darker = this.colorLuminance(bg_color, -.25);

	// 	this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});
	// 	// this.$el.css({'background-color': bg_color, 'color': text_color});

	// 	return this;
	// }

	// remove: function(){
	// 	// TODO, this should fire a call to the api
	// 	console.log(this.model.url())
	// 	this.model.destroy();
	// },


});
views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	events: {
		'click input.destroy': 'destroyEvent',
		'submit form': 'saveModal',
	},

	initialize: function(){

		this._subviews = [];
		// var that = this;
		// Don't need to do anything on initialize
		// this.d3_el = d3.select(this.el);

		this.listenTo(this.model, 'change:in_selection', this.killView);
		this.listenTo(this.model, 'refresh', this.refresh); // TODO, change where this is triggered
	},

	refresh: function(){
		this.silenceView();

		// Clear if present
		// this.d3_el.select('.event-content').remove();
		this.render();
	},

	render: function(){
		this.silenceAllSubviews();

		var model_json = this.model.toJSON();
		var event_item_markup = templates.articleDetailEventFactory( _.extend(model_json, helpers.templates.articles) );
		this.$el.html(event_item_markup);

		this.$eventTagsContainer = this.$el.find('.event-tags-container');

		this.postRender();

		// this.edit_event_btn_modal_outer = edit_event_btn_modal_outer;

		// this.renderModal();

		return this;

	},

	postRender: function(){

		this.bakeTags();
		this.bakeEventEditor();

		return this;
	},

	bakeTags: function(){

		var impact_tags = this.model.get('impact_tags_full');
		impact_tags.forEach(function(impactTag){
			var tag_view = new views.ArticleSummaryDrawerImpactTag({model: impactTag})
			var tag_markup = tag_view.render().el;
			this._subviews.push(tag_view);
			this.$eventTagsContainer.append(tag_markup);
		}, this);

		return this;
	},

	bakeEventEditor: function(){

		var event_editor_view = new views.EventEditor({el: this.$el, model: this.model.toJSON()});
		this._subviews.push(event_editor_view);

		this._time_picker = event_editor_view._time_picker;
		this.$el.append(event_editor_view.el);

		this.event_editor_view = event_editor_view;

		return this;

	},

	saveModal: function(e){
		e.preventDefault();

		var self = this;

		var current_view = this.event_editor_view,
		    form_data = current_view.getSettings();

		current_view.validate(current_view.form_info.schema, form_data, function(err, msg){
			if (!err){
				self.disableBtns();
				self.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on event edit', response);
						var err = response.responseJSON;
						// TODO, test
						current_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model

						self.render();
						// Clear submit message
						current_view.printMsgOnSubmit(false, '');
						// Close the modal
						self.toggleModal(e);
					}
				});
			} else {
				current_view.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	},

	update: function(model, inSelection){
		if (!inSelection){
			this.killView();
		}

		return this;
	},

	destroyEvent: function(e){
		var self = this;
		// TODO animate this outro
		this.model.destroy({
    	success: function(model, response) {
				self.killView();
				self.toggleModal(e);
			},
			error: function(error){
				console.log('Error deleting event.', error);
			}
		});
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	disableBtns: function(){
		this.event_editor_view.$form.find('.buttons-container').addClass('disabled');
	}

});
views.ArticleDetailImpactTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayoutWithTooltip();
		// TODO, look into when this is ever getting destroyed
		this.listenTo(this.model, 'change:destroy', this.destroyView)
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);

		this.$el.html(tag_markup);
		return this;
	},

	// getLabel: function(){
	// 	var category = this.model.get('category'),
	// 			level = helpers.templates.prettyName(this.model.get('level')),
	// 			tooltip_text = level + ' ' + category;

	// 	return tooltip_text;
	// },

	// destroyView: function(model, destroyMode){
	// 	if (destroyMode){
	// 		this.killView();
	// 		this.model.set({destroy: false}, {silent: true});
	// 	}
	// }

});
views.ArticleDetailSubjectTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayout();
		this.listenTo(this.model, 'destroy', this.destroyView)
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), { toTitleCase: helpers.templates.articles.toTitleCase });
		var tag_markup = templates.articleDetailTagFactory(tag_data);
		this.$el.html(tag_markup);
		return this;
	},

	destroyView: function(model){
		this.killView();
	}

});
views.ArticleDetailSubjectTagEditor = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	events: {
		'change': 'toggleChecked'
	},

	initialize: function (options) {
		// Is this model checked?
		var article_subject_tag_ids = _.pluck(options.articleTags, 'id');
		this.model.set('checked', _.contains(article_subject_tag_ids, this.model.id));

		this.listenTo(this.model, 'change:checked', this.syncToApi);
		return this;
	},

	render: function () {
		var tag_data = _.extend({}, this.model.toJSON(), helpers.templates.articles);
		var tag_markup = templates.articleDetailAccountSubjectTagFactory(tag_data);
		this.$el.html(tag_markup);

		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	toggleChecked: function(){
		var checked = this.$el.find('input').prop('checked');
		this.model.set('checked', checked);
	},

	syncToApi: function(model, checked){
		var self = this;
		var method = (checked) ? 'update' : 'delete';
		var col = collections.article_detailed_subject_tags.instance
		this.$el.addClass('disabled');

		col.sync(method, model, {
			success: function(modelBack, msg, response){
				var type = this.type;
				if (type === 'DELETE') {
					col.remove(model);
				} else if (type == 'PUT'){
					col.add(model);
				}
				self.$el.removeClass('disabled');
			},
			error: function(model, msg, response){
				app.instance.reportErr(model, response);
				self.$el.removeClass('disabled');
			}
		});

	}

});
views.ArticleDetailVizArticleReferrers = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var self = this;

		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);


		var domain_facets_from_article = ga_metrics.ga_pageviews_by_article_referrer,
				total_pageviews = ga_metrics.ga_pageviews;

		// Add display name as the same
		// And sort descending
		domain_facets_from_article = _.chain(domain_facets_from_article).each(function(facetInfo){
			facetInfo.facet_display_name = self.prettyPrintUrl(facetInfo.facet);
		}).sortBy(function(obj){
			return -obj.value
		}).value();

		this.data = domain_facets_from_article;
		this.total = total_pageviews;

		return this;
	},

	render: function(renderMarker){
		var self = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		var bar_container = _columns.append('div')
			.classed('bar-container', true);


		// Do the bullet
		bar_container.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.value / self.total)*100).toFixed(2) + '%';
				});

		bar_container.append('div')
					.classed('label', true)
					.classed('bar-text', true)
					.html(function(d){
						var percent = self.fancyPercent(d.value/self.total),
								count = (d.value) ? (helpers.templates.addCommas(d.value)) : ''; // Only print this string if count isn't zero

						return '<a href="http://'+d.facet+'" target="_blank">'+self.prettyPrintUrl(d.facet+'/mhkmhkmhkmhkmhkmhkmhkmhkmhkmhkmhkmhk')+'</a> &mdash; ' + percent+ ', ' + count;
					});


		this.bar_container = bar_container;

		return this;

	},

	prettyPrintUrl: function(url){
		// Strip out http
		url = url.replace(/(http|https):\/\//,'').replace(/^www./, '');
		// Bold domain
		url = url.replace(/([a-zA-Z0-9]([a-zA-Z0-9\-]{0,65}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/i, function(match){
			return '<span class="highlight">'+match+'</span>';
		});

		return url;

	}

});
views.ArticleDetailVizDeviceFacet = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.calcComparisonMarkerParams();
		this.$el.attr('data-which', which);

		// Listen for marker redraw
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.redrawMarker);

		// Bake device facets
		var device_facets = [
			{
				facet: "ga_pageviews_desktop",
				facet_display_name: "desktop",
				value: 0 
			},{
				facet: "ga_pageviews_tablet",
				facet_display_name: "tablet",
				value: 0
			},{
				facet: "ga_pageviews_mobile",
				facet_display_name: "mobile",
				value: 0
			}
		];

		// Add data to our above schema
		device_facets.forEach(function(deviceFacet){
			deviceFacet.value = ga_metrics[deviceFacet.facet] || deviceFacet.value;
		});

		this.data = device_facets;
		this.total = ga_metrics.ga_pageviews;

		return this;
	}

});
views.ArticleDetailVizDomainFacets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);


		var domain_facets_from_article = ga_metrics.ga_pageviews_by_domain,
				total_pageviews = ga_metrics.ga_pageviews;

		// Add display name as the same
		// And sort descending
		domain_facets_from_article = _.chain(domain_facets_from_article).each(function(facetInfo){
			facetInfo.facet_display_name = facetInfo.facet;
		}).sortBy(function(obj){
			return -obj.value
		}).value();

		this.data = domain_facets_from_article;
		this.total = total_pageviews;

		return this;
	}

});
views.ArticleDetailVizInternalExternal = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.calcComparisonMarkerParams();
		this.$el.attr('data-which', which);

		// Listen for marker redraw
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.redrawMarker);

		var entrances = ga_metrics.ga_entrances,
				pageviews = ga_metrics.ga_pageviews;

		// Get percentage for these later by dividing the facet by pageviews.
		this.data = [
			{
				facet: 'ga_per_internal',
				facet_display_name: 'internal',
				value: pageviews - entrances
			},{
				facet: 'ga_per_external',
				facet_display_name: 'external',
				value: entrances
			}
		];

		// Which we'll store as total to be consistent with the other vizs
		this.total = pageviews;

		return this;
	}

});
views.ArticleDetailVizTweets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var tweets = options.tweets,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);

		this.data = tweets;

		return this;
	},

	// Override the base view's `render` function
	render: function(){
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _tweets = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		_tweets.append('div')
			.classed('tweet-container', true)
			.html(function(d){
				d.meta.embed = d.meta.embed || '';
				var html_centered_without_script = d.meta.embed.replace('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>', '').replace('blockquote class="', 'blockquote class="tw-align-center ');
				return html_centered_without_script;
			})

			// No idea why wrapping it in this works but it does
			// Hitting window.twttr.widgets.load(); should work without being in a setTimeout
			setTimeout(function(){
				window.twttr.widgets.load();
			}, 0);


		return this;	
	}


});
views.ArticleDrawerSorter = Backbone.View.extend({

	events: {
		'change select': 'setSort',
		'click .sort-direction': 'toggleSortDir'
	},

	initialize: function(){
		// Don't need to do anything on initialize
		this.$sorter = this.$el.find('select');
		this.$direction = this.$el.find('.sort-direction');
		this.render();
	},

	render: function(){
		var sorterJson = this.collection.getSortableDimensions(),
				sort_by = collections.dimensions.instance.metadata('sort_by'); // This is our version without the `-`;

		var options_markup = sorterJson.map(function(sorterObj){
			var sort_name = sorterObj.sort_name,
					selected = (sort_name == sort_by || sort_name == ('metrics.'+sort_by) ) ? 'selected' : '',
					disabled = (sorterObj.disabled) ? 'disabled' : '';

			return '<option value="'+sort_name+'" '+selected+' '+disabled+'>'+helpers.templates.articles.prettyMetricName(sorterObj.name)+'</option>'
		}).join('');

		this.$sorter.append(options_markup);
	},

	setSort: function(){
    var val = this.$sorter.val();
    var direction = this.$direction.attr('data-dir') || '';
   	models.content_item_filters.set('sort_by', direction+val).trigger('filter');
	},

	toggleSortDir: function(){
		var direction = this.$direction.attr('data-dir');
		if (!direction){
			this.$direction.attr('data-dir', '-');
		} else {
			this.$direction.attr('data-dir', '');
		}

		this.setSort();
		return this;
		
	}


});
views.ArticleSearcher = Backbone.View.extend({

	events: {
		'keyup input': 'listenForKeyup',
		'click .clear': 'clearSearch'
	},

	initialize: function(){

		// Clear on load
		this.$input = this.$el.find('input');
		this.$clearBtn = this.$el.find('.clear');
		this.$input.val('');

		this.setSearchVal_debounced = _.debounce(this.setSearchVal, 250);

	},

	listenForKeyup: function(e){
		var val = this.$input.val();

		if (val){
			this.toggleClearBtn(true);
		} else {
			this.toggleClearBtn(false);
		}

		// Check if it's roughly a character key
		if (e.which !== 0){
			this.setSearchVal_debounced(val);			
		}

		return this;

	},

	setSearchVal: function(val){
		// console.log('search q', val);

		val = val || ''; // Coerce false to empty string
		if (val){
			// this.runBloodhound(val, this.addResultingCidsToFilter);
			models.content_item_filters.set('q', val);
		} else {
			models.content_item_filters.unset('q', val);
		}
		models.content_item_filters.trigger('filter');
		return this;
	},

	setSearchField: function(val){
		val = val || '';
		this.$input.val(val);
		this.setSearchVal(val);
	},

	clearSearch: function(){
		this.setSearchField(false);
		this.toggleClearBtn(false);

		return this;
	},

	toggleClearBtn: function(show){
		var visibility = (show) ? 'visible' : 'hidden';
		this.$clearBtn.css('visibility', visibility);

		return this;
	}

});
views.ArticleSummaryDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer': 'toggleActive'
		// 'click .drawer-list-outer': 'updateSelected'
	},

	initialize: function(){
		// Keep track of views created by this view
		this._subviews = [];
		this.updateActiveSelectionField();

		// Our drawer has two states, `compare` and `detail`
		// They should maintain whether they are selected under those conditions
		// So they have a selected property for each one `selected_for_compare` and `selected_for_detail`
		// Therefore, listen for changes in `section_mode` and apply what our active selection property should point to
		this.listenTo(models.section_mode, 'change:mode', this.updateActiveSelectionField);
		
		this.listenTo(this.model, 'change:active_selected', this.setActiveCssState);

		// Use this to make this field act as a binary across the collection
		this.listenTo(this.model, 'change:selected_for_detail', this.setDetailDrawerDisplay);

		// Listen for a destroy event 
		this.listenTo(this.model, 'destroy', this.destroy);

		// Add an event listener sot hat this model can be set on and off without being clicked on
		this.listenTo(this.model, 'toggleElement', this.toggleActive);

	},

	render: function(){
		var drawer_list_item_markup = templates.articleSummaryDrawerFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		// Set the css on load to its default settings
		this.$subjectTagsContainer = this.$el.find('.subject-tags-container');
		this.$impactTagsContainer = this.$el.find('.impact-tags-container');

		this.addTags();
		
		this.setActiveCssState();
		return this;
	},

	updateActiveSelectionField: function(model, mode){
		mode = mode || models.section_mode.get('mode');
		this.selected_for = mode;
	},

	toggleActive: function(){
		var mode = this.selected_for;

		if (mode == 'compare'){
			this.model.toggle('selected_for_'+mode);
			this.model.toggle('active_selected');
		} else if (mode == 'detail'){
			app.instance.sectionMode.detail.call(app.instance, this.model.get('id'));
		}

		return this;

	},

	clearRadios: function(detailId){
		collections.article_summaries.instance.filter(function(model){
			var model_id = model.get('id');
			return model_id != detailId;
		}).forEach(function(model){
			model.set({
				active_selected: false,
				selected_for_detail: false
			});
		});

		return this
	},

	setDetailDrawerDisplay: function(model, selectedForDetail){
		// console.log('non-drawer')
		var id = model.get('id'),
				active_selected = model.get('active_selected');
		if (selectedForDetail){

			this.clearRadios(id);
			if (!active_selected) {
				this.model.set('active_selected', true);
			} 
		}
	},

	setActiveCssState: function(){
		var state = this.model.get('active_selected');
		// this.updateActiveSelectionField();
		// var active_selected = this.model.get('active_selected') || false, //Coerce `undefined` to `false`
		// 		selected_for_compare = this.model.get('selected_for_compare') || false, // Samesies
		// 		selected_for_detail = this.model.get('selected_for_detail') || false, // Et encore une fois
		// 		id = this.model.get('id'),
		// 		current_mode_selection_state = this.model.get('selected_for_'+this.selected_for) || false;


		// console.log('selected for compare',selected_for_compare)
		// console.log('active selected',active_selected)

		this.$el.find('.drawer-list-outer').toggleClass('active', state);
		this.$el.find('.inputs-container input').prop('checked', state);

		return this;
	},

	// TODO, maybe make these smaller to only show part of the name or not show the name at all
	addTags: function(){
		var subject_tags_full_unique = _.uniq(this.model.get('subject_tags_full'), function(tag){
					return tag.id;
				}),
				impact_tags_full_unique  = _.uniq(this.model.get('impact_tags_full'), function(tag){
					return tag.id;
				});

		if (subject_tags_full_unique.length) {
			this.$subjectTagsContainer.html('<span class="tag-list-title">Subj:</span>')
			subject_tags_full_unique.forEach(function(subjectTag){
				var tag_model  = new models.subject_tag.Model(subjectTag);
				var tag_view = new views.ArticleSummaryDrawerSubjectTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this._subviews.push(tag_view);

				this.$subjectTagsContainer.append(tag_markup);
			}, this);
		}


		// TODO, maybe make this view into a generic tag view or make a separate more specific impact view that shows level and category
		if (impact_tags_full_unique.length) {
			this.$impactTagsContainer.html('<span class="tag-list-title">Imp:</span>')
			impact_tags_full_unique.forEach(function(impactTag){
				var tag_model  = new models.subject_tag.Model(impactTag);
				var tag_view = new views.ArticleSummaryDrawerImpactTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this._subviews.push(tag_view);
				this.$impactTagsContainer.append(tag_markup);
			}, this);
		}


	},

	destroy: function(model){
		this.killView();
	}

});
views.ArticleSummaryDrawerImpactTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayoutWithTooltip();
		// TODO, investigate whther this ever gets desroyed
		this.listenTo(this.model, 'change:destroy', this.destroyView);
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);

		this.$el.html(tag_markup);
		// The only real distinction between this and the subject tag version
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	},

	// styleLayout: function(){
	// 	var bg_color = this.getColor(),
	// 			text_color = this.whiteOrBlack(bg_color),
	// 			bg_color_darker = this.getBorderColor();

	// 	// this.$el.css({'background-color': bg_color, 'color': text_color, 'border-color': bg_color_darker});
	// 	this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

	// 	var tooltip_text = this.getLabel();
	// 	this.$el.addClass('tooltipped').attr('aria-label', tooltip_text);

	// 	return this;
	// },

	// getLabel: function(){
	// 	var category = this.model.get('category'),
	// 			level = helpers.templates.prettyName(this.model.get('level')),
	// 			tooltip_text = level + ' ' + category;

	// 	return tooltip_text;
	// },

	// destroyView: function(model, destroyMode){
	// 	if (destroyMode){
	// 		this.killView();
	// 		this.model.set({destroy: false}, {silent: true});
	// 	}
	// }

});
views.ArticleSummaryDrawerSubjectTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayout();
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);
		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	}

	// styleLayout: function(){
	// 	var bg_color = this.model.get('color'),
	// 			text_color = this.whiteOrBlack(bg_color),
	// 			bg_color_darker = this.colorLuminance(bg_color, -.25);

	// 	// this.$el.css({'background-color': bg_color, 'color': text_color});
	// 	this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

	// 	return this;
	// }
});
views.ArticleSummaryRow = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-row-wrapper',

	events: {
		'click .destroy': 'removeRow'
	},

	initialize: function(){
		this.listenTo(this.model, 'removeFromComparison', this.destroy);
		this.listenTo(this.model, 'redrawMarker', this.redrawMarker);

		// Store how we're calculating the marker 
		this.calcComparisonMarkerParams();
	},

	render: function() {
		var $el = this.$el,
				model_json = this.model.toJSON(),
				data_for_template = _.extend(
					{
						selects: this.collection.getSelectDimensions(),
						calcSize: this.calcSize,
						comparisonOperation: this.comparison_marker_operation,
						comparisonMax: this.comparison_marker_max,
						comparisonGroup: this.comparison_marker_group
					}, 
					model_json, 
					helpers.templates.articles);

		var article_detail_markup = templates.articleSummaryRowFactory( data_for_template ),
				subject_tags_str = '',
				impact_tags_count = 0; // For now these are separate, which seems to make the most sense. You sort subject matter categorically and impact by number


		this.$el.html(article_detail_markup);

		// Add our selects for 
		this.$el.attr('data-title', model_json.title)
						.attr('data-created', model_json.created);

		// Add a whole bunch of quant attributes dynamically
		_.each(model_json.metrics, function(val, key){
			$el.attr('data-'+key, val);
		});

		// Add all names for our tags, these should already be in alphabetical order from the hydration process
		if (model_json.subject_tags_full) { 
			subject_tags_str = _.pluck(model_json.subject_tags_full, 'name').join('');
		} 
		$el.attr('data-subject_tags', subject_tags_str);


		// Do the same for impact tags
		if (model_json.impact_tags_full) { 
			impact_tags_count = model_json.impact_tags_full.length
		} 

		$el.attr('data-impact_tags', impact_tags_count);

		this.model_json = model_json;
		this.bullet_markers = d3.select(this.el).selectAll('.marker');

		return this;
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // mean
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // all
		this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('max'); // per_97_5
		return this;
	},

	redrawMarker: function(){
		this.calcComparisonMarkerParams();

		var self = this;
		var markers = this.bullet_markers
			.style('left', function(){
				var d3_el = d3.select(this),
						metric_name = d3_el.attr('data-metric-name');
				return self.calcSize.call(self, metric_name, self.comparison_marker_operation, self.comparison_marker_max, self.comparison_marker_group);
			});

	},

	removeRow: function(){
		collections.article_comparisons.instance.remove(this.model);
		app.instance.saveHash();
		return this;
	},

	destroy: function(model, destroyMode){
		if (app.instance.$isotopeCntnr) { 
			app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); 
		}
		this.killView();

		return this;
	},

	calcSize: function(metric, val, max, group){
		/** Metric options: per97_5, per75, median, per25, per2_5, per5, per95, mean **/
		group = group || this.comparison_marker_group;
		max = max || this.comparison_marker_max;

		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object_list;
		if (group == 'all'){
			comparison_object_list = models.comparison_metrics.get(group);
		} else {
			comparison_object_list = models.comparison_metrics.get('subject_tags')[group];
		}

		var this_metrics_info = $.extend(true, {}, _.findWhere(comparison_object_list, {metric: metric})),
				max,
				scale,
				val_percent;

		if (this_metrics_info){
			max = this_metrics_info[max];

			scale = d3.scale.linear()
									.domain([0, max])
									.range([0, 97]);

			var numb_val
			if (typeof val == 'string') {
				// console.log(val)
				numb_val = this_metrics_info[val];
				if (!val){
					console.log('ERROR: Missing max comparison value for group', group, 'and metric', metric, 'in field', val);
					val = 0;
				}
			}
			// console.log(metric, numb_val, val, max, group, this_metrics_info)

			var to_scale_val = numb_val || val

			val_percent = Math.round(scale(to_scale_val)).toString() + '%';
			
		}else{
			console.log('ERROR: Missing comparison values for group', group, 'and metric', metric, 'for group', group, 'in comparison object list', comparison_object_list);
			val_percent = '0%';
		}
		return val_percent;
	}

});

views.DateRangeSearcher = Backbone.View.extend({

	events: {
		'click .clear': 'clearDateRange'
	},

	pikaday_options: {
		// clearInvalidInput: true,
			timezone: pageData.timezone,
		// onClear: function(){
		// 	// Always clear our filter selection invalid date aka date deleted
		// 	// I feel this is nice because then if you have an invalid date, you're not still filtering by some date range selection that you can no longer see
		// 	collections.po.article_summaries.filters.timestamp.clearQuery();
		// 	// Clear the min and max dates, it would be nice of `picker.clearDate()` did this;
		// 	// https://github.com/dbushell/Pikaday/pull/134
		// 	this.setMinDate();
		// 	this.setMaxDate();
		// }
	},

	initialize: function(){
		// Clear these form values, these might be left over if the page was refreshed and the browser is doing something fancy
		var $els = this.$el.find('input');
		$els.val('');

		this.$clearDateRange = this.$el.find('.clear');

		// Make the two input boxes Pikaday intances
		// These have some slightly different behavior in their `onSelect` callback regarding max and min date setting so make them separate objects
		var that = this;

		var $start_el = this.$el.find('input[data-dir="after"]');
		var $end_el   = this.$el.find('input[data-dir="before"]');
		
		var start_opts = {
			field: $start_el[0],
			onSelect: function() {
				var date_obj = this.getDate();

				var moment_timezone_date = this.getMoment(),
						pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

				// On min date selection, set the max date for the end
				that.picker_end.setMinDate(date_obj);

				// Change the viewing range to the start date
				if (!that.picker_end.getDate()){
				  that.picker_end.gotoDate(date_obj);
				}

				$start_el.val(pretty_date_string)

			},
			onClose: function(){
				if (!$start_el.val()){
					that.picker_end.setMinDate();
					this._d = '';
				}
				that.filterByDate.call(that);
			}
		};
		var end_opts = {
				field: $end_el[0],
				onSelect: function() {
					var date_obj = this.getDate();

					var moment_timezone_date = this.getMoment(),
							pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

					// On min date selection, set the max date for the end
					that.picker_start.setMaxDate(date_obj);

					$end_el.val(pretty_date_string);

				},
				onClose: function(){
					if (!$end_el.val()){
						that.picker_start.setMaxDate();
						this._d = '';
					}
					that.filterByDate.call(that);
				}
			};
		// Add our options
		_.extend(start_opts, this.pikaday_options);
		_.extend(end_opts, this.pikaday_options);
		this.picker_start = new Pikaday( start_opts );
		this.picker_end = new Pikaday( end_opts );

		// this.$start_el = $start_el;
		// this.$end_el = $end_el;
		this.$els = $els
	},

	clearDateRange: function(e){
		this.picker_start._d = '';
		this.picker_start.setMaxDate();
		this.picker_end._d = '';
		this.picker_end.setMinDate();
		this.$els.val('');
		$(e.currentTarget).css('visibility', 'hidden');
		this.filterByDate();
	},

	assembleValidDates: function(){
		// Make sure both of them have dates
		// This also checks against them being strings and other nonsense
		return [this.picker_start, this.picker_end].map(function(picker, index){
			var name = (index ? 'created_before' : 'created_after'),
			    date = picker.getDate();
			if (date) { 
				date = picker.getMoment().format();
			}
			return {name: name, value: date};
		});
	},

	filterByDate: function(){
		var dates = this.assembleValidDates(),
				start_timestamp,
				end_timestamp;

		// Setting or unsetting these values will trigger a change event which will construct filter parameters to the URl
		dates.forEach(function(dateInfo){
			if (dateInfo.value){
				models.content_item_filters.set(dateInfo.name, dateInfo.value);
				// // If we have at least one date set, then we'll be showing the clear button
				this.$clearDateRange.css('visibility','visible');
			} else {
				models.content_item_filters.unset(dateInfo.name, dateInfo.value);
			}
		}, this);
		// Do this manually do avoid double calls
		models.content_item_filters.trigger('filter');
	}

});
views.DivisionSwitcher = Backbone.View.extend({

	events: {
		'click li': 'setMode'
	},
	initialize: function(){
		// Update the button active state and the hash
		this.listenTo(this.model, 'change:mode', this.updateActiveState);
		this.updateActiveState();
	},

	setMode: function(e){
		// Only set it if it's different, i.e. doesn't have an `active` class
		// This doesn't make that much of a difference because we listen for change events
		// But it's still nice
		var $el = $(e.currentTarget);
		if (!$el.hasClass('active')){
			var mode = $el.attr('data-mode');
			this.model.set('mode', mode);
		}
		return this;
	},

	updateActiveState: function(model, mode){
		// Put a data attribute on the drawer for css purposes in the article view
		// This lets you have a different hover style when you hover over a checkbox article summary so you know you can do something to it
		$('#drawer').attr('data-mode', mode);
		$('#content').attr('data-mode', mode);
		// Set the active state on the li
		this.$el.find('li').removeClass('active');
		this.$el.find('li[data-mode="'+mode+'"]').addClass('active');

		return this;
	}
});
views.EventCreator = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'saveModal' // All other forms are filled out by their parent view, but the parent view is the `articleDetail` and that is already cluttered
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Save a fresh copy under `schema`, only perform a shallow clone since we won't be modifying its children
		var event_creator_schema = _.clone(pageData.eventCreatorSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.form_info = {
			schema: event_creator_schema,
			vals: options.model
		};

		// Prep the area by creating the modal markup
		if (!options.disableModal){
			this.bakeModal('Create an event');
		} else {
			this.$form = this.$el.find('form')
		}

		this.saveMsg = options.saveMsg || '';

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});

	},

	refresh: function(){
		this.silenceAllSubviews();

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});

		// Clear submit message
		this.flashSubmitMsg(false, this.saveMsg);

		return this;

	},

	render: function(){

		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();

		var self = this;

		var form_data = this.getSettings();

		this.validate(this.form_info.schema, form_data, function(err, msg){
			if (!err){
				self.toggleBtnsDisabled();
				self.printMsgOnSubmit(false, '');
				// Unlike other models, we use a `create` here instead of a save.
				this.collection.create(form_data, {
					wait: true,
					error: function(model, response, options){
						console.log('Server error on event edit', response);

						self.toggleBtnsDisabled();
						self.printMsgOnSubmit(true, 'Error '+response.status+': ' + response.responseText.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						console.log(response)

						// Close the modal
						// self.toggleModal(e);
						self.refresh();

					}
				});

			} else {
				self.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	}


});
views.EventCreatorFromAlert = views.AA_BaseForm.extend({

	// events: _.extend({
	// }, views.AA_BaseForm.prototype.events),

	// assignmentTemplateFactory: _.template('<div class="article-assignee"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\' /></div>'),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);
		// var required_keys = [];
		// Only some of the values on object are editable in the form
		var model = options.model;
		var alert_options = {
			status: 'approved',
			created: model.created,
			url: model.url,
			img_url: model.img_url,
			content_items: model.content_items,
			title: model.title,
			description: model.description,
			tag_ids: model.tag_ids
		};

		// Add default values to the schema under the `selected` property
		// var event_creator_schema_with_values = this.combineFormSchemaWithVals(event_creator_schema, alert_options);

		// Set our list of required keys
		// _.each(event_creator_schema_with_values, function(val, key){
		// 	if (val.required){
		// 		required_keys.push(key);
		// 	}
		
		// });

		// // Store this on the schema with this article's information on the view
		// // We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.form_schema = event_creator_schema_with_values;
		// this.full_schema = event_creator_schema_with_values;
		var form_info = {
			schema: event_creator_schema,
			vals: alert_options
		};
		// this.required_keys = required_keys;
		this.form_info = form_info;

		// Prep the area by creating the modal markup
		this.bakeModal('Create an event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});
	},

	render: function(){
		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	}

});
views.EventEditor = views.AA_BaseForm.extend({

	events: _.extend({
		// 'submit form': 'saveModal'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Add the passed in options
		// _.extend(this, _.pick(options, 'assignee'));
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		// Save a fresh copy under `schema`
		var event_creator_schema = _.clone(pageData.eventCreatorSchema);
		// Don't allow for a change in assignment
		delete event_creator_schema.content_items;

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.form_info = {
			schema: event_creator_schema,
			vals: options.model
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Edit this event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: false, pikaday: true});
	},

	render: function(){
		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons(true); // `true` to bake delete button

		this.$form.html(markup);

		return this;
	}


});
// views.LoadAllDrawerItems = Backbone.View.extend({

// 	events: {
// 		'click .view-all:not(.active)': 'setHash',
// 	},
// 	initialize: function(){
// 		// Update the button active state and the hash
// 		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
// 		this.$drawerListOuter = this.$el.find('.drawer-list-outer');
// 	},

// 	setHash: function(){
// 		routing.router.navigate('my-recipes', {trigger: true});
// 		return this;
// 	},

// 	setActiveCssState: function(){
// 		var active = this.model.get('viewing');
// 		this.$drawerListOuter.toggleClass('active', active);
// 		this.$drawerListOuter.find('input').prop('checked', active);
// 	}

// });
views.RecipeCreator = views.AA_BaseRecipe.extend({

	events: _.extend({
		// 'submit form': 'createRecipe',
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		var sous_chef = opts.sousChef,
				recipe_info = this.separateSchemaFromEvent(sous_chef.options);

		var recipe_schema = recipe_info.settingsInfo,
				set_event_schema = recipe_info.eventInfo,
				sous_chef_name = sous_chef.slug;

		// Cache CSS selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Add the sous_chef name as a hidden field
		recipe_schema.sous_chef = {
			input_type: 'hidden',
			default: sous_chef_name,
			required: true
		};

		// Delete tag_ids since we got that covered in the default event
		delete recipe_schema.tag_ids;

		// Make an object of our selected vals based on defaults
		var recipe_vals = {};
		_.each(recipe_schema, function(val, key){
			if (val.default){
				recipe_vals[key] = val.default;
			}
		});

		// // Set the defaults on this object to the selected val
		// // And exract a list of required keys
		// _.each(recipe_schema, function(val, key){
		// 	if (val.default){
		// 		val.selected = val.default;
		// 	}
		// 	// if (val.required){
		// 	// 	required_keys.push(key);
		// 	// }
		// });


		this.recipe_info = {
			schema: recipe_schema,
			vals: recipe_vals
		};
		this.event_info = {
			schema: set_event_schema,
			vals: {}
		};
		this.form_info = {
			schema: _.extend({}, recipe_schema, set_event_schema),
			vals: _.extend({}, recipe_vals)
		};

		// Save the values we'll use throughout the view
		// this.form_schema = recipe_schema;
		// this.event_schema = set_event_schema;
		// this.full_schema = $.extend(true, {}, recipe_schema, set_event_schema);
		// this.required_keys = required_keys;

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher, set the article searcher assigne mode to set event
		this.postRender({search: true});
		this.updateScheduleByLayout('minutes');

		return this;
	},

	render: function(){
		var markup = '',
				recipe_info = this.recipe_info,
				default_event_markup

		// Bake the initial form data
		_.each(recipe_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, recipe_info.vals[fieldName]);
		}, this);
		

		this.$form.prepend(markup);

		var default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		return this;
	},

	renderDefaultEvent: function(){
		var markup = '',
				set_event_info = this.event_info;

		// Bake the initial form data
		_.each(set_event_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, true);
		}, this);

		return markup
	}


});
views.RecipeDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'filter',
		'click .settings-switch': 'toggleModal',
		'click .toggle-default-event': 'toggleDefaults',
		'submit form': 'saveModal',
		'click .destroy': 'destroyModel'
	},

	initialize: function(){
		this._subviews = [];
		
		// // TODO temporary until this is added as a key on all recipes
		// this.model.set('set_default_event', this.model.hasDefaultEvent());

		this.listenTo(this.model, 'filter', this.filter);
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);

		return this;
	},

	render: function(){

		this.silenceAllSubviews();

		var drawer_list_item_markup = templates.recipeFactory( _.extend(this.model.toJSON(), helpers.templates) );

		this.$el.html(drawer_list_item_markup);
		this.$form = this.$el.find('form');

		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event');
		this.$submitMsg = this.$el.find('.submit-msg');

		this.postRender();
		return this;
	},

	postRender: function(){
		this.bakeRecipeEditor();
	},

	bakeRecipeEditor: function(){
		var recipe_editor_view = new views.RecipeEditor({el: this.el, model: this.model.toJSON()})
		this._subviews.push(recipe_editor_view);

		this.$el.append(recipe_editor_view.el);
		this.recipe_editor_view = recipe_editor_view;

		return this;
	},

	filter: function(){
		var that = this,
				recipe_id = this.model.id;

		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, recipe_id);
		app.instance.show_all_view.deactivate();
		this.model.set('viewing', true);
		// Set the hash
		routing.router.navigate('my-recipes/'+recipe_id);

		return this;

	},

	// renderEnabled: function(model, enabled){
	// 	this.$el.find('.enable-switch')
	// 					.attr('data-enabled', enabled)
	// 					.html(helpers.templates.formatEnabled(enabled));

	// 	return this;
	// },

	toggleModal: function(e){
		this.killEvent(e);
		views.helpers.toggleModal(e);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();


		var that = this;

		var recipe_editor_view = this.recipe_editor_view,
		    set_default_event = this.model.get('set_default_event'),
		    form_data = recipe_editor_view.getSettings(set_default_event),
		    form_info = recipe_editor_view.form_info;

    recipe_editor_view.setProcessing(e, true)
		recipe_editor_view.printMsgOnSubmit(false, '');

		this.recipe_editor_view.validate(form_info.schema, form_data, function(err, msg){
			if (!err){

				that.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on recipe edit', response);
						var err = response.responseJSON;
						console.log(err)
						// TODO, test
				    recipe_editor_view.setProcessing(e, false)
						recipe_editor_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						that.render();
						// Clear submit message
						recipe_editor_view.printMsgOnSubmit(false, '');
						// Close the modal
						that.toggleModal(e);
				    recipe_editor_view.setProcessing(e, false)
					}
				});

			} else {
				recipe_editor_view.printMsgOnSubmit(err, msg);
		    recipe_editor_view.setProcessing(e, false)
			}

		}, this);

		return this;

	},

	destroyModel: function(e){
		var that = this;
		this.model.destroy({
			success: function(model, response, options){
				// console.log('recipe destroyed', response);
				// TODO, fancier animation on success
				that.toggleModal(e);
				that.$el.remove();
			},
			error: function(model, response, options){
				console.log('error in model destroy', response)
				alert('Your destroy did not work. Please try again. Check the console for errors.')
			}
		});

		return this;
	},

	// toggleEnabled: function(e){
	// 	this.killEvent(e);
	// 	this.model.set('enabled', !this.model.get('enabled'));
	// },

	killEvent: function(e){
		e.stopPropagation();
	},

	setActiveCssState: function(model, viewing){

		this.$el.find('.drawer-list-outer').toggleClass('active', viewing);
		this.$el.find('.inputs-container input').prop('checked', viewing);

		return this;
	},

	toggleDefaults: function(){
		this.model.set('set_default_event', !this.model.get('set_default_event') )
	},

	showHideDefaults: function(model, open){
		var slide_duration = 350;
		if (open){
			this.$defautEventsBtn.html('Enabled').attr('data-status', 'true');
			this.$defaultEvents.slideDown(slide_duration, 'easeOutQuint');
		} else {
			this.$defautEventsBtn.html('Disabled').attr('data-status', 'false');
			this.$defaultEvents.slideUp(slide_duration, 'easeOutQuint');
		}
	}


});
views.RecipeDrawerStatic = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'filter',
	},

	initialize: function(){
		this._subviews = [];

		this.listenTo(this.model, 'filter', this.filter);
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);

		return this;
	},

	render: function(){
		if (this._time_picker){
			this._time_picker.destroy();
		}

		var drawer_list_item_markup = templates.recipeStaticFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		this.$form = this.$el.find('form');

		return this;
	},

	filter: function(){
		var that = this,
				recipe_id = this.model.id;

		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, recipe_id);
		app.instance.show_all_view.deactivate();
		this.model.set('viewing', true);
		// Set the hash
		routing.router.navigate('my-recipes/manual');

		return this;

	},

	killEvent: function(e){
		e.stopPropagation();
	},

	setActiveCssState: function(model, viewing){

		this.$el.find('.drawer-list-outer').toggleClass('active', viewing);
		this.$el.find('.inputs-container input').prop('checked', viewing);

		return this;
	}


});
views.RecipeEditor = views.AA_BaseRecipe.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation' // Stop propagation so that clicks in our modal form don't trigger a click on the drawer item
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		// console.log('here',opts.model.options.set_event_tag_ids[0])
		var recipe_info = this.separateSchemaFromEvent(opts.model.options),
				recipe_options = recipe_info.settingsInfo,
				set_event_options = recipe_info.eventInfo;

				// console.log(opts.model)

		var sous_chef = collections.sous_chefs.instance.findWhere({slug: opts.model.sous_chef});
		if (!sous_chef){
			console.log('ERROR Could not find sous chef of name', opts.model.sous_chef, 'In list:', collections.sous_chefs.instance)
		}
		var sous_chef_options = sous_chef.get('options');

		var sous_chef_info = this.separateSchemaFromEvent(sous_chef_options),
				sous_chef_schema = sous_chef_info.settingsInfo,
				set_event_schema = sous_chef_info.eventInfo;

		// Add the name, description and scheduling options manually
		// Since those aren't `options` but top level values
		var recipe_vals = _.extend({
			name: opts.model.name,
			description: opts.model.description,
			schedule_by: opts.model.schedule_by,
			time_of_day: opts.model.time_of_day,
			minutes: opts.model.minutes,
			crontab: opts.model.crontab
		}, recipe_options);

		this.recipe_info = {
			schema: sous_chef_schema,
			vals: recipe_vals
		};
		this.event_info = {
			schema: set_event_schema,
			vals: set_event_options
		};
		this.form_info = {
			schema: _.extend({}, sous_chef_schema, set_event_schema),
			vals: _.extend({}, recipe_vals, set_event_options)
		};

		// Cache some jQuery selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Bake the modal container and form elements
		this.render();
		// // Init the title searcher, disable pikaday
		this.postRender({search: true});
		this.updateScheduleByLayout(); // calling this with nothing will trigger a change event on the dropdown which will trigger a layout

		return this;
	},

	render: function(){
		var markup = '',
				recipe_info = this.recipe_info,
				default_event_markup;

				// console.log(recipe_info)

		// Bake the initial form data
		_.each(recipe_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, recipe_info.vals[fieldName]);
		}, this);

		this.$form.prepend(markup);

		default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		return this;
	},

	renderDefaultEvent: function(){
		var markup = '',
				default_event_info = this.event_info;

		// Bake the initial form data
		_.each(default_event_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, 'default_event', default_event_info.vals[fieldName]);
		}, this);

		return markup
	},
	
	stopPropagation: function(e){
		e.stopPropagation();

		return this;
	}

});
views.SettingFacebookPage = views.AA_BaseSettingListItemRecipe.extend({

	initialize: function(options){

		this.default_model_opts = {
			sous_chef: 'facebook-page-to-event',
			name: app.defaults.staff_facebook_page_to_promotion_recipe_name,
			options: {
				search_query: pageData.org.homepage
			},
			validate: function(attrs){
				if (!attrs.options.search_query){
					return 'You must supply a homepage for this recipe to be valid';
				}
			}
		};

		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[page_id]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});
views.SettingImpactTag = views.AA_BaseSetting.extend({

	tagName: 'li',

	initialize: function(){


		// Create the inner html from our subject tag template
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();

		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['name', 'color', 'category', 'level']);
		this.initColorPicker('impact-tag');

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.impact_tag.Model({});
			collections.impact_tags.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	},

	render: function(){

		var subject_tag_markup = templates.impactTagFactory({});

		this.$el.html(subject_tag_markup);

		return this;
	}


});
views.SettingPassword = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// Cache some initial values and set listeners
		this.initializeBase();

		var $oldField			= this.getPasswordEl('old');
		var $newField 		= this.getPasswordEl('new');
		var $confirmField = this.getPasswordEl('confirm');

		this.fields = [$oldField, $newField, $confirmField];

		this.listenTo(this.model, 'change:data_needs_correction', this.setDataCorrection);
		this.model.set('patch', true);

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	inputHasChanged: function(e){
		e.preventDefault();
		e.stopPropagation();
		// Save the input to an attribute unless we just hit the return key
		// In that case, submit the form
		var return_key_code = 13,
				esc_key_code = 27,
				incoming_val;

		if (e.keyCode == return_key_code){
			this.saveModel(e);
		} else if (e.keyCode == esc_key_code){
			this.revertToPreviousSettingVal(e);
		} else {
			incoming_val = this.getCurrentFormData();
			this.model.set('input_val', incoming_val);
			// console.log(incoming_val)
			this.compareFormData();
		}

		return this;
	},
	getPasswordEl: function(which){
		return this.$form.find('input[type="password"][data-which="'+which+'"]');
	},

	setDataCorrection: function(model, value){
		this.$form.attr('data-needs-correction', value.toString());
		return this;
	},

	compareFormData: function(){
		var old_password = this.getPasswordEl('old').val(),
				new_password = this.getPasswordEl('new').val(),
				confirm_password = this.getPasswordEl('confirm').val(),
				all_good = (old_password && new_password && (new_password === confirm_password));

		if (old_password || new_password || confirm_password){
			this.flagErrors();
		}
		
		var confirm_error = ((new_password || confirm_password) && (new_password != confirm_password) ) ? true : false;
		this.flagErrors(this.getPasswordEl('confirm'), confirm_error);


		this.model.set('data_changed', all_good);

		return this;
	},

	revertToPreviousSettingVal: function(){
		this.model.set('data_changed', 'false');
		this.model.set('data_inputted', 'false');

		this.fields.forEach(function($el){
			$el.val('');
		});

		return true;
	},

	flagErrors: function($el, needsCorrection){
		if ($el){
			$el.toggleClass('js-needs-correction', needsCorrection);
		} else {
			this.fields.forEach(function($el){
				var val = $el.val().trim(),
						is_empty = val == '';

				$el.toggleClass('js-needs-correction', is_empty);
			})
			
		}
	}

});
views.SettingRssFeed = views.AA_BaseSettingListItemRecipe.extend({


	initialize: function(options){

		this.default_model_opts =  {
			sous_chef: 'rss-feed-to-article',
			name: app.defaults.rss_feed_recipe_name
		};
		
		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[feed_url]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});
views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals();

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	render: function(){
		var template = this.options.template || this.template;
		var parent_el = this.options.parentEl || this.parentEl;

		if (template){
			this.$el.html(template( {} ));
			if (parent_el){
				$(parent_el).append(this.el);
			}
		}

		return this;

	},

	postSaveHook: function(){
		var required_fields = ['homepage', 'timezone'];

		required_fields.forEach(function(requiredField){
			var saved_model_name = this.model.get('name'),
					saved_model_value = this.model.get('value');
			if (requiredField == saved_model_name){
				pageData.org[requiredField] = saved_model_value;
			}
		}, this);

		if (pageData.org.homepage && pageData.org.timezone){
			$('#promotion').attr('data-required-fields-set', 'true');
			
		}
	}

});
views.SettingStaffTwitterList = views.AA_BaseSettingListItemRecipe.extend({


	initialize: function(options){
		
		this.default_model_opts = {
			sous_chef: 'twitter-list-to-event',
			name: app.defaults.staff_twitter_list_to_promotion_recipe_name,
			options: {
				search_query: pageData.org.homepage
			},
			validate: function(attrs){
				if (!attrs.options.search_query){
					return 'You must supply a homepage for this recipe to be valid';
				}
			}
		};

		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[list_owner_screen_name]', 'options[list_slug]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});
views.SettingSubjectTag = views.AA_BaseSetting.extend({

	tagName: 'li',

	initialize: function(){

		// Create the inner html from our subject tag template
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();

		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['name', 'color']);
		this.initColorPicker('subject-tag');

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.subject_tag.Model({});
			collections.subject_tags.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	},

	render: function(){

		var subject_tag_markup = templates.subjectTagFactory({});

		this.$el.html(subject_tag_markup);

		return this;
	}

});
views.SettingTwitterUser = views.AA_BaseSettingListItemRecipe.extend({


	initialize: function(options){
		
		this.default_model_opts =  {
			sous_chef: 'twitter-user-to-event',
			name: app.defaults.staff_twitter_user_to_promotion_recipe_name,
			options: {
				search_query: pageData.org.homepage
		  },
			validate: function(attrs){
				if (!attrs.options.search_query){
					return 'You must supply a homepage for this recipe to be valid';
				}
			}
		};

		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[screen_name]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});
views.ShowAllRecipes = Backbone.View.extend({

	tagName: 'div',

	className: 'drawer-container',

	events: {
		'click .drawer-list-outer:not(.active)': 'setState'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		// this.listenTo(this.model, 'change:active', this.filter);

	},

	render: function(hasRecipes){
		var tag_markup = templates.drawerMyRecipesPrepFactory({hasRecipes: hasRecipes});

		this.$el.html(tag_markup);
		// Set its state to active on render, if our view variable is set to all
		this.styleLayout(true);
		// this.setState();
		return this;
	},

	setState: function(){
		this.styleLayout(true);
		this.filter();
	},

	styleLayout: function(mode){

		// Set the other one to false
		collections.recipes.instance.where({viewing: true}).forEach(function(accountRecipe){
			accountRecipe.set('viewing', false);
		});

		// This is either the `all` or the id of the current recipe
		this.$el.find('.drawer-list-outer').toggleClass('active', mode);
		this.$el.find('.inputs-container input').prop('checked', mode);

	},

	filter: function(){
		// Pass `all` as the recipe id, which `setActiveAlertsPerRecipe` will figure out what to do with
		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, 'all');

		// Clear the hash
		routing.router.navigate('my-recipes');
	},

	deactivate: function(){
		this.styleLayout(false);
	}



});
views.SousChefDrawerItem = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	initialize: function(){

		return this;
	},

	render: function(){
		var drawer_list_item_markup = templates.sousChefDrawerItemFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		return this;
	}

});
views.SousChefForm = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper mode-content',

	events: {
		'click .toggle-default-event': 'toggleDefaults',
		'submit form': 'save'
	},

	initialize: function(){
		this._subviews = [];
		this.listenTo(this.model, 'change:destroy', this.destroy);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);

		return this;
	},

	render: function() {
		var river_item_markup = templates.sousChefFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event');
		this.$submitMsg = this.$el.find('.submit-msg');
		if (this.model.get('set_default_event')) {
			this.$defaultEvents.show();
			this.showHideDefaults();
		}

		this.postRender();
		return this;
	},

	postRender: function(){
		this.bakeRecipeCreator();

		return this;
	},

	bakeRecipeCreator: function(){
		var event_creator_view = new views.RecipeCreator({el: this.el, sousChef: this.model.toJSON()})
		this._subviews.push(event_creator_view);

		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;
	},

	save: function(e){
		e.preventDefault();

		var that = this;

		var recipe_creator_view = this.event_creator_view,
				form_info = recipe_creator_view.form_info,
		    set_default_event = this.model.get('set_default_event'),
		    form_data = recipe_creator_view.getSettings(set_default_event);

    recipe_creator_view.setProcessing(e, true)
		recipe_creator_view.printMsgOnSubmit(false, '');

		var new_recipe_creator_model = new models.recipe_creator.Model; 

		this.event_creator_view.validate(form_info.schema, form_data, function(err, msg){
			if (!err){
				// This could also be done through `collection.sync('create ...` but we already wrote this
				// and it gives more granularity for where we add this model to the recipe drawer collection
				new_recipe_creator_model.save(form_data, {
					error: function(model, response, options){
						var err = response.responseJSON;
						recipe_creator_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
				    recipe_creator_view.setProcessing(e, false)
					},
					success: function(model, response, options){
						that.render();
						that.flashSubmitMsg(false, 'Recipe saved!');
						// Give it some dummy stuff so it can appear in the drawer
						var id = response.id;
						model.set('event_counts', null);
						// TEMPORARY, this might be set on the server at some point
						model.set('set_default_event', set_default_event);
						model.set('id', id);
						// TEMPORARY, should this be ordered this way?
						// Add this as the second element in the array 
						collections.recipes.instance.add(model, {at: 0}); 
				    recipe_creator_view.setProcessing(e, false)
					}
				});
			} else {
				recipe_creator_view.printMsgOnSubmit(err, msg);
		    recipe_creator_view.setProcessing(e, false)
			}

		}, this);

	},

	flashSubmitMsg: function(error, msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		this.$submitMsg.removeClass('success').removeClass('fail');
		// Fade out message, then make sure it's visible for the next time
		this.$submitMsg.addClass(class_name).html(msg).delay(7000).fadeOut(500).delay(750)
           .queue(function(next) { 
           	$(this).html('').removeClass(class_name).show();
           	next(); 
           })
	},

	toggleDefaults: function(){
		this.model.set('set_default_event', !this.model.get('set_default_event') )
	},

	showHideDefaults: function(){
		var open = this.model.get('set_default_event'),
				slide_duration = 350;
		if (open){
			this.$defautEventsBtn.html('Enabled').attr('data-status', 'true');
			this.$defaultEvents.slideDown(slide_duration, 'easeOutQuint');
		} else {
			this.$defautEventsBtn.html('Disabled').attr('data-status', 'false');
			this.$defaultEvents.slideUp(slide_duration, 'easeOutQuint');
		}
	}

});
views.Tag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag-wrapper',

	events: {
		'click': 'toggle'
	},

	initialize: function(){

		this.listenTo(this.model, 'change:active', this.styleLayout);
		// this.listenTo(this.model, 'change:active', this.filter);
		// this.listenTo(models.tag_facets, 'change', this.updateLayoutByCount);

	},

	render: function(){
		var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), helpers.templates) );

		this.$el.html(tag_markup);
		this.updateLayoutByCount();
		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		// On initialize, hide tags that aren't in use
		// But on filter, mark them as disabled 
		// This is to avoid jumpy UI
		this.hasInitialized = true;
		return this;
	},

	styleLayout: function(){
		var is_active = this.model.get('active') || false,
				bg_color = this.model.get('color'),
				set_bg_color = 'auto',
				set_text_color = 'auto';

		var $tagContainer = this.$el.find('.tag-container')

		$tagContainer
						.css('border-left-color', bg_color);

		// If this is active
		// Give it an active class
		// And set its background color to the one defined in its model
		// And the appropriate text color
		if (is_active) {
			set_bg_color = bg_color;
			set_text_color = this.whiteOrBlack(set_bg_color);
		}

		this.$el.toggleClass('active', is_active);
		$tagContainer
						.css({'background-color': set_bg_color, 'color': set_text_color});

		// The version in Chromium that Electron uses doesn't like setting our bg color to transparent
		// So if the computed style doesn't match our declared style
		// Do some heavy surgery on the style attr
		var computed_bg = $tagContainer.css('background-color');

		if (this.hexToRgbStr(set_bg_color) !== computed_bg){
			$tagContainer.attr('style', 'border-left-color:'+bg_color+';')
		}

		return this;
	},

	toggle: function(){
		this.model.toggle('active');
		return this;
	},

	updateLayoutByCount: function(){
		var count = this.getCount(),
				show_el = count > 0;

		this.setCount(count);

		if (this.hasInitialized){
			this.$el.toggleClass('disabled', !show_el);
		} else {
			this.$el.toggle(show_el);
		}

		return this;
	},

	setCount: function(count){

		this.$el.find('.tag-count').html(count);

		return this;

	}


});
views.TagEventFilter = views.Tag.extend({

	initialize: function(options){
		// Do everything our view.Tag does
		views.Tag.prototype.initialize.call(this);
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.setOpts);
		this.listenTo(models.event_tag_facets, 'change', this.updateLayoutByCount);

		this.filterModel = options.filterModel;
		// this.tagFacets   = options.tagFacets;

	},

	setOpts: function(tagModel, isActive){
		var info = this.getImportantModelInfo(),
				group = info.group,
				value = _.values(info.id_key_value)[0],
				combined_group = group;

		var filter_model = this.filterModel;

		var tag_list = filter_model.get(group) || [];

		if (group == 'tags'){
			combined_group = 'tag_ids' // Do more massaging to handle hwo the API wants this parameter
		}

		if (isActive){
			tag_list.push(value);
		}else{
			tag_list = _.without(tag_list, value);
		}

		var has_tags = tag_list.length > 0;

		if (has_tags){
			filter_model.set(combined_group, tag_list);
		} else {
			filter_model.unset(combined_group);
		}

		filter_model.metadata(combined_group, has_tags);
		filter_model.trigger('filter');

		return this;
	},

	// Will return a single key/value pair of either the `id` and its id or the `name` and its name (for categories and levels)
	getImportantModelInfo: function(){
		var group = this.model.collection.metadata('filter'),
				model_json = this.model.toJSON(),
				info = _.pick(model_json, 'id'); // For tags, this is the id, but for tag attributes it's the name


		// Change our group name from `impact_tag_ids` to `tags`, which is how that's nested in our tag facet coming back from the api
		// We don't set it to this by default because our sorter requires that as the key. Instead of having two separate things, we do some massaging here
		if (/_tag_ids/.test(group)){
			group = 'tags';
		}

		// So do some testing if that came out to empty and take the name instead if so
		if (_.isEmpty(info)){
			info = _.pick(model_json, 'name'); 
		}

		return {id_key_value: info, group: group};
	},

	// Used to figure out, for tags, categories and levels
	getCount: function(){
		var info = this.getImportantModelInfo(),
				group = info.group,
				find_obj = {};

		var replacements = {
			categories: 'category',
			levels: 'level'
		};

		// Do one last bit of massaging to remove the `s` from the group, which will give our key name
		// It's current `{name: 'internal'}` but that should be `{level: 'internal'}`
		if (replacements[group]){
			find_obj[replacements[group]] = _.values(info.id_key_value)[0];
		} else {
			find_obj = info.id_key_value;
		}

		var facet = models.event_tag_facets.get(group);
		// var facet = this.tagFacets.get(group);
		var countInfo = _.findWhere(facet, find_obj) || {count: 0};

		return countInfo.count;

	}



});
views.TagSectionNav = views.Tag.extend({

	initialize: function(){
		// Do everything our view.Tag does
		views.Tag.prototype.initialize.call(this);
		this.$clearBtn = this.$el.parents('.option-container[data-group="filters"]').find('.clear');
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.setOpts);
		this.listenTo(models.tag_facets, 'change', this.updateLayoutByCount);

	},

	setOpts: function(tagModel, isActive){
		var info = this.getImportantModelInfo(),
				group = info.group,
				value = _.values(info.id_key_value)[0],
				combined_group;

		// if (/_tags/.test(group)){
		// 	combined_group = 'tag_ids' // Do more massaging to handle how the API wants this parameter
		// }
		
		var tag_list = models.content_item_filters.get(group) || [];

		if (isActive){
			tag_list.push(value);
		}else{
			tag_list = _.without(tag_list, value);
		}

		var has_tags = tag_list.length > 0;


		if (has_tags){
			models.content_item_filters.set(group, tag_list);
		} else {
			models.content_item_filters.unset(group);
		}

		// Use this metadata group to set our X clear button.
		// We can't use our model params because they conflate the group names
		// We could handle that name conflation downstream but we'd also have to do string replacement
		models.content_item_filters.metadata(group, has_tags);
		models.content_item_filters.trigger('filter');

		return this;
	},

	// Will return a single key/value pair of either the `id` and its id or the `name` and its name (for categories and levels)
	getImportantModelInfo: function(){
		var group = this.model.collection.metadata('filter'),
				model_json = this.model.toJSON(),
				info = _.pick(model_json, 'id'); // For tags, this is the id, but for tag attributes it's the name


		// So do some testing if that came out to empty and take the name instead if so
		if (_.isEmpty(info)){
			info = _.pick(model_json, 'name'); 
		}

		return {id_key_value: info, group: group};
	},

	// Used to figure out, for tags, categories and levels
	getCount: function(){
		var info = this.getImportantModelInfo(),
				group = info.group,
				find_obj = {};

		// Change our group name from `subject_tag_ids` to `subject_tags` and same for impact tags
		// We don't set it to this by default because our sorter requires that as the key. Instead of having two separate things, we do some massaging here
		if (/_tag_ids/.test(group)){
			group = group.replace('_tag_ids', '_tags');
		}
		
		var replacements = {
			categories: 'category',
			levels: 'level'
		};

		// Do one last bit of massaging to remove the `s` from the group, which will give our key name
		// It's current `{name: 'internal'}` but that should be `{level: 'internal'}`
		if (replacements[group]){
			find_obj[replacements[group]] = _.values(info.id_key_value)[0];
		} else {
			find_obj = info.id_key_value;
		}

		var facet = models.tag_facets.get(group);
		var countInfo = _.findWhere(facet, find_obj) || {count: 0};

		return countInfo.count;

	}



});
views.helpers = {

	toggleModal: function(e){
		e.preventDefault();
		e.stopPropagation();
		var $modalParent = $(e.currentTarget).parents('.modal-parent');
		var $tray = $modalParent.find('.modal-outer');
		$tray.toggleClass('active', !$tray.hasClass('active'));
		// This will set `overflow: hidden` so you can't horizontal scroll
		$('body').attr('data-modal', $tray.hasClass('active'));
		// Give the parent a flag to control styles and things
		$modalParent.attr('data-modal-open', $tray.hasClass('active'));

		// Center it
		this.centerishInViewport( $tray.find('.modal-inner') );
	},

	centerishInViewport: function($el){
		// Center the element horizontally and ten percent above the center of vertical
		var el_width = $el.outerWidth(),
		    el_height = $el.outerHeight(),
		    v_width = $(window).width(),
		    v_height = $(window).height();


		$el.css({
			top:  _.max([4, (((v_height/2 - (el_height/2))/v_height*100) - 10)]) + '%',
			left: (v_width/2 - (el_width/2))/v_width*100 + '%' 
		});
	},

	// groupSetEventOptions: function(json){
	// 	json.set_event_options = {};
	// 	_.each(json.options, function(val, key){
	// 		if (/^set_event_/.test(key)){
	// 			json.set_event_options[key] = val;
	// 			delete json.options[key];
	// 		}
	// 	});
	// 	return json;
	// }
}
// PourOver views
views.po = { };
app.ApprovalRiver = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .js-internal-link': 'setGlobalLoading',
		'click .scroll-to': 'scrollTo',
		'click .load-more': 'loadMoreAlerts'
	},

	initialize: function(){

		// Keep track of views rendered by this view
		this._subviews = [];




		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');

		this.setLoading(this.$content, 'true');

		// Update hash and active collection on mode change
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// When an alert is added or removed from the active_alerts collection, add or remove it
		this.listenTo(collections.active_alerts.instance, 'add', this.alerts.add);
		this.listenTo(collections.active_alerts.instance, 'remove', this.alerts.remove);

		// Create views for every one of the models in the collection and add them to the page
		this.render();

		// Bind scrolling here because backbone events doesn't like to do it
		// var that = this;
		// this.$content.on('scroll', function(){
		// 	var $content = $(this);
		// 	// that.lazyLoadAlerts.call(that, $content);
		// })
		// this.enableWaypoint(); 
	},

	setLoading: function($target, state){
		$target.attr('data-loading', state);
	},

	saveHash: function(mode){
		routing.router.navigate(mode);
	},

	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');
			// Set loading state
			this.setLoading(this.$drawer, 'true');
			// Clear the active alerts so that when we switch back they are re-added
			collections.active_alerts.instance.reset(null);
			// Kill all subviews
			this.killAllSubviews();
			this.$content.find('.placeholder').remove();
			this.sectionMode[mode].call(this);
			this.saveHash(mode);

			return this;

		},

		'my-recipes': function(){

			// Stash some selectors
			var $drawer = this.$drawer,
					$drawerPointers = $drawer.find('#drawer-pointers-container'),
					$content = this.$content,
					$recipes = $('#recipes');

			$drawer.attr('data-mode', 'my-recipes');

			// Bake recipe buttons in the drawer
			// Prep the drawer with our show all button, which is an instance of the show all view
			var has_recipes = collections.recipes.instance.length > 1;
			var show_all_view = new views.ShowAllRecipes({}),
					show_all_markup = show_all_view.render(has_recipes).el;

			// Stash this so we might destroy it on divisionSwitch
			this._subviews.push(show_all_view);
			// Set the initial state, unless we want to hold off because we have something in the hash that will load stuff
			if (!app.instance.pause_init){
				show_all_view.setState();
			}
			// Save it so we might modify the drawer-outer active state on selection of other options
			this.show_all_view = show_all_view;
			$drawerPointers.html(show_all_markup);

			// Bake the manual recipe
			var manual_recipe_model = collections.recipes.instance.findWhere({id: -1});
			var manual_recipe_view = new views.RecipeDrawerStatic({model: manual_recipe_model}),
					manual_recipe_markup = manual_recipe_view.render().el;
			this._subviews.push(manual_recipe_view);
			$recipes.append(manual_recipe_markup);

			// Bake the other recipes
			if (has_recipes){
				collections.recipes.instance.each(function(recipeModel){
					// Skip over our manual-event recipe
					// We do this because we still want it in our collection so it's findable like the others with `collection.findWhere(id)`
					if (recipeModel.id !== -1){
						var item_view = new views.RecipeDrawer({model: recipeModel}),
								item_markup = item_view.render().el;
						this._subviews.push(item_view);

						$recipes.append(item_markup);
					}
				}, this);
			} else {
				$content.html('<div class="placeholder">You don\'t have any recipes. Click <a href="/approval-river#create">create</a> to make some. &mdash; <em>Merlynne</em></div>');
			}

			this.setLoading(this.$drawer, 'false');

			return this;

		},

		create: function(){

			// Stash some selectors
			var $drawer = this.$drawer,
					$drawerPointers = $drawer.find('#drawer-pointers-container'),
					$content = this.$content,
					$recipes = $('#recipes');

			// Clear the load more button
			this.clearLoadMoreButton();

			// Add the pointer text
			var recipe_creator_prep_markup = templates.drawerCreatePrep;
			$drawerPointers.html(recipe_creator_prep_markup);

			// Add the table of contents of recipe schema
			collections.sous_chefs.instance.each(function(sousChefSchema){
				var item_view = new views.SousChefDrawerItem({model: sousChefSchema}),
						item_el   = item_view.render().el;
				this._subviews.push(item_view);
				$recipes.append(item_el)
			}, this);

			// Add the recipe creator forms
			collections.sous_chefs.instance.each(function(sousChef){
				var item_view = new views.SousChefForm({model: sousChef}),
						item_el   = item_view.render().el;

				this._subviews.push(item_view);

				$content.append(item_el)
			}, this);

			this.setLoading(this.$content, 'false');

			return this;

		}
	},

	alerts: {
		add: function(alertModel){
			// Actions to take when adding an item to the drawer
			var item_view,
					item_el;

			item_view = new views.Alert({model: alertModel});
			item_el = item_view.render().el;

			this.setLoading(this.$content, 'false');
			this._subviews.push(item_view);
			this.$content.append(item_el);

			return this;
		},
		remove: function(alertModel){
			alertModel.set('destroy', 'remove');
			// this.setLoading(this.$content, 'false');

			return this;
		}
	},

	render: function(){
		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })

		return this;
	},

	content: {

		setActiveAlertsPerRecipe: function(recipeId){

			// Do some cleanup
			// Get rid of the load more button
			this.clearLoadMoreButton.call(this);

			// Add the loading state, some Merlynne potions
			this.setLoading(this.$content, 'true');

			var that = this, // `this` is `app.instance`.
					page_size = collections.active_alerts.instance.metadata('page_size');

			// Stash this here so our load more button can know what it's doing
			// The more pure way would be to have that button be part of a view on that collection, but we don't currently have such a view set up
			// And this is easy enough
			collections.active_alerts.instance.metadata('recipe_id', recipeId);

			// If a collection for this recipe doesn't exist, then create it
			if (!collections.loaded_alerts['recipe_'+recipeId+'_instance']){
				collections.loaded_alerts['recipe_'+recipeId+'_instance'] = new collections.loaded_alerts.Collection([]);
			}

			var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
			var pagination_info = loaded_alerts_collection.metadata('pagination');

			var fetch_options = {
				remove: false,
				data: {}, 
				success: function(collection, response, options){
					// Add all of this collections models into the DOM
					collections.active_alerts.instance.set(collection.models);

					// Call the load more button, which has its own logic on whether it should display itself and how it behaves
					that.setLoadMoreButton.call(that, recipeId);
				},
				error: function(model, err){
					console.log('Error fetching alerts for recipe', model, err);
				}
			};

			var provenance;
			if (recipeId != 'all'){
				if (recipeId === -1){
					provenance = 'manual';
				} else {
					provenance = 'recipe';
					fetch_options.data.recipe_ids = recipeId;
				}
				// If it's not all, we need to query with a recipe id
				fetch_options.data.provenance = provenance;
			}

			// If we've fetched this already, then it will stored, otherwise, go and look on the recipe
			// Add this logic to protect against the count being `0`.
			var recipe_alerts_pending_count = loaded_alerts_collection.metadata('total'),
					recipe_alerts_counts;
			if (!recipe_alerts_pending_count && recipe_alerts_pending_count !== 0){
				recipe_alerts_counts = collections.recipes.instance.findWhere({id: recipeId}).get('event_counts');
				if (recipe_alerts_counts){
					recipe_alerts_pending_count = recipe_alerts_counts.pending;
				} else {
					recipe_alerts_pending_count = 0;
				}
			}

			// Do we have alerts in memory
			var alert_models_in_memory = loaded_alerts_collection.models;
			// Reset their destroy mode so that we might destroy it later
			alert_models_in_memory.forEach(function(alertModel){
				alertModel.set('destroy', null);
			});

			// If we don't have pending alerts, say so, otherwise, figure out how to load them either from memory, the server, or both
			if (!recipe_alerts_pending_count){
				that.$content.html('<div class="placeholder">This recipe doesn\'t have any pending alerts. I\'ll let you know here when I find some!<br/>&mdash; <em>Merlynne</em></div>');
				// Zero-out our collection
				collections.active_alerts.instance.set(alert_models_in_memory);
				this.setLoading(this.$content, 'false');
				// If we have no models in memory, fetch the first page
			} else if (!alert_models_in_memory.length){
				// Clear the placeholder, if it exists
				that.$content.find('.placeholder').remove();
				// Clear the active collection
				collections.active_alerts.instance.set([]);
				// Fetch new alerts, callbacks specified in `fetch_options`.
				loaded_alerts_collection.fetch(fetch_options);
			}else {
				// Clear the placeholder, if it exists
				that.$content.find('.placeholder').remove();
				// If we're not fetching, that is to say, we have a full page already in memory, just set those models
				collections.active_alerts.instance.set(alert_models_in_memory);
				// Call the load more button, which has its own logic on whether it should display itself and how it behaves
				that.setLoadMoreButton.call(app.instance, recipeId);
			}

			return this;

		}


	},

	loadMoreAlerts: function(e){

		// Set the button to loading mode
		app.helpers.gifizeLoadMoreButton($(e.currentTarget));

		var that = app.instance, // This is `app.instance`.
				recipeId = collections.active_alerts.instance.metadata('recipe_id');


		var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
		var pagination_info = loaded_alerts_collection.metadata('pagination');

		var current_page = pagination_info.page;

		var fetch_options = {
			remove: false,
			data: { 
				page: current_page + 1
			},
			success: function(collection, response, options){
				// Add them to the dom
				collections.active_alerts.instance.add(response.events);
				// Call the load more button, which has its own logic on whether it should display itself and how it behaves
				that.setLoadMoreButton.call(that, recipeId);
			},
			error: function(model, err){
				console.log('Error fetching more alerts detail', err);
			}
		};

		var provenance;
		if (recipeId != 'all'){
			if (recipeId === -1){
				provenance = 'manual';
			} else {
				provenance = 'recipe';
				// If it's not all, we need to query with a recipe id
				fetch_options.data.recipe_ids = recipeId;
			}
			fetch_options.data.provenance = provenance;
		}

		// Fetch for the next page of results
		loaded_alerts_collection.fetch(fetch_options);

		return this;
	},

	clearLoadMoreButton: function(){
		this.$content.find('.load-more').remove();
	},
	
	setLoadMoreButton: function(recipeId){

		// To be created and appended below, if we need it.
		var $loadMore;

		// Always kill the button
		this.clearLoadMoreButton();

		var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
		var pagination_info = loaded_alerts_collection.metadata('pagination');

		var current_page = pagination_info.page,
				page_size = pagination_info.per_page,
				total_pages = pagination_info.total_pages;

		var currently_loaded_count = loaded_alerts_collection.length,
				total_pending_for_recipe_id = loaded_alerts_collection.metadata('total');

		// Do we need the button
		var more_alerts_to_load = current_page < total_pages,
				remaining_alerts = total_pending_for_recipe_id - currently_loaded_count,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				load_more_str;

		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMore = $('<button class="load-more"></button>');
			load_more_str = 'Showing ' + currently_loaded_count + ' out of ' + total_pending_for_recipe_id + '. Load ' + to_load_string + ' more...'
			// Finally, append it as the last thing
			$loadMore.html(load_more_str).appendTo(this.$content);
		}

		return this;
	},

	// enableWaypoint: function(){
	// 	console.log(this.$el.find('.recipe-form-container').length)
	// 	this.$el.find('.recipe-form-container').waypoint(function(dir) {
	// 		console.log(dir)
	// 		var $this = $(this),
	// 				id = $this.find('.title').attr('id').replace('-recipe','')
	// 				idx;
	// 		$('.drawer-list-outer.scroll-to').removeClass('active');
	// 		if (dir == 'down'){
	// 			$('.drawer-list-outer.scroll-to[data-destination="'+id+'"]').addClass('active');
	// 		} else if (dir == 'up'){
	// 			idx = $('.recipe-form-container').index( $this );
	// 			$($('.drawer-list-outer.scroll-to')[idx]).addClass('active')
	// 		}
	// 	},{ context: this.$content, offset: 50 });
	// },

	scrollTo: function(e){
		var dest = $(e.currentTarget).attr('data-destination'),
				buffer = 10;
		this.$content.animate({
			scrollTop: (this.$content.scrollTop() + $('#'+dest+'-recipe').position().top - parseFloat(this.$content.css('padding-top')) - buffer)
		}, 200);
	}

});
app.Articles = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .js-internal-link': 'setGlobalLoading',
		'click .add-to-comparison': 'addToComparison',
		'click .option-title .show-hide': 'showHideList',
		'change #drawer-toggle-all': 'toggleAllDrawer',
		'click #alter-comparison-marker': 'updateComparisonMarker',
		'click .load-more[data-which="article-summaries"]': 'moreSummaryArticles',
		'click .go-to-detail': 'goToDetail',
		'click .option-container[data-group="filters"] .clear': 'clearFilters',
		'click #add-article .modal-toggle': 'toggleModal',
		'click #add-article .modal-close': 'toggleModal'
	},

	initialize: function(){
		// Keep track of views rendered by this view
		this._subviews = [];

		// Cache these selectors
		this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
		this.$impactTagCategoriesList = $('.option-container[data-type="categories"] .tag-list');
		this.$impactTagLevelsList = $('.option-container[data-type="levels"] .tag-list');
		this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
		
		this.tag_list_els = {
			subject_tags: this.$subjectTagList.parent(),
			categories: this.$impactTagCategoriesList.parent(),
			levels: this.$impactTagLevelsList.parent(),
			impact_tags: this.$impactTagList.parent()
		};

		this.$articleList = $('#article-list');
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');
		this.$drawerPointersCntnr = $('#drawer-pointers-container');
		this.$articleTitleSearcher = $('#article-title-searcher');
		this.$dateRangeSearcher = $('#date-range-searcher');
		this.$articleDrawerSorter = $('#article-drawer-sorter');
		this.$addArticle = $('#add-article');

		this.isotopeCntnr = '.rows';
		this.isotopeChild = '.article-detail-row-wrapper';


		// Update hash and active collection on mode change
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// Listen for adds and removes to the article summaries collection
		// And populate the drawer on `add` and `remove`
		// this.listenTo(collections.article_summaries.instance, 'change', this.updateToggle);
		this.listenTo(collections.article_summaries.instance, 'add', this.drawer.add);
		this.listenTo(collections.article_summaries.instance, 'remove', this.drawer.remove);
		this.listenTo(collections.article_summaries.instance, 'error', this.reportErr);
		this.listenTo(collections.article_summaries.instance, 'update change:selected_for_compare', this.checkToggleState);


		// As you move things in and out of the comparison view
		// Listen to its collection and `add` and `remove things accordingly
		this.listenTo(collections.article_comparisons.instance, 'add', this.comparison.add);
		this.listenTo(collections.article_comparisons.instance, 'remove', this.comparison.remove);

		// When an item is added or removed from the detail collection, add or remove it
		// The remove is somewhat unnecessary since `this.$content`'s html is emptied. But it's consistent with our other code.
		this.listenTo(collections.article_detailed.instance, 'add', this.detail.add);
		this.listenTo(collections.article_detailed.instance, 'remove', this.detail.remove);
		this.listenTo(collections.article_detailed.instance, 'error', this.reportErr);

		// Listen for changes in facet counts and show hide all tag controls
		this.listenTo(models.tag_facets, 'change', this.updateTagContainerByCounts);

		var fetchByParameters_debounced = _.debounce(this.fetchByParameters, 5); // Only by 5ms to avoid multiple calls in a loop such as when using the `.clear` button but also avoid a sluggish UX
		// Listen for changes in facet counts and show hide all tag controls
		this.listenTo(models.content_item_filters, 'hasChanged', fetchByParameters_debounced);


		// Create views for every one of the models in the collection and add them to the page
		this.render();
		this.$toggleAllBtn = $('#drawer-toggle-all');

		// Listen to scroll so you can sticky the filter
		var that = this;
		this.$content.on('scroll', function(){
			var $content = $(this);
			that.onScrollTick.call(that, $content);
		})
	},

	render: function(){

		this.$drawerPointersCntnr.append(templates.drawerPointers);

		/* Drawer tag */
		// Article tags
		if (collections.subject_tags.instance.length){
			this.$subjectTagList.html('');
			collections.subject_tags.instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$subjectTagList.append(tag_view.render().el);
			}, this);
		}

		// Impact tags
		if (collections.impact_tags.instance.length){
			this.$impactTagList.html('');
			collections.impact_tags.instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (collections.impact_tag_attributes.categories_instance.length){
			this.$impactTagCategoriesList.html('');
			collections.impact_tag_attributes.categories_instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (collections.impact_tag_attributes.levels_instance.length){
			this.$impactTagLevelsList.html('');
			collections.impact_tag_attributes.levels_instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		/* Article Summaries in the drawer */
		collections.article_summaries.instance.each(function(article){
			var article_view = new views.ArticleSummaryDrawer({model: article});
			this.$articleList.append(article_view.render().el);
		}, this);

		// If you have subject tags, render them as options in the article comparison dropdowns
		// But only if they have associated content items
		collections.subject_tags.instance.each(function(subjectTag){
			if (subjectTag.get('content_item_count')) {
				var $option = $('<option></option>').val(subjectTag.get('id')).html(subjectTag.get('name'))
				$option.appendTo('.alter-comparison-marker[data-which="group"]');
			}
		});

		// These views are okay to stick around (ie. not added to the subviews array and killed at any point) because they are only created once and then the page is refreshed, which clears them
		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher });

		new views.ArticleSearcher({el: this.$articleTitleSearcher[0]});

		new views.DateRangeSearcher({el: this.$dateRangeSearcher[0]});

		new views.ArticleDrawerSorter({el: this.$articleDrawerSorter[0], collection: collections.dimensions.instance});

		this.bakeArticleAdder();

		// Hide the tag lists based on what the counts are
		this.updateTagContainerByCounts();

		this.setLoading(this.$drawer, 'false');
		this.$articleCount = this.$drawer.find('.item-text[data-which="article-count"]');

		this.setLoadMoreButton();

		return this;
	},

	setLoading: function($target, state){
		$target.attr('data-loading', state);
	},

	reportErr: function(model, msg){
		var response = msg.responseJSON;
		console.log('ERROR in model:', model);
		console.log('ERROR message:', response);
		alert(response.error  +' ' + response.status_code + ': ' + response.message);
	},

	fetchByParameters: function(increment){
		var params = models.content_item_filters.assembleQueryParams();
		var current_page = collections.article_summaries.instance.metadata('pagination').page;
		this.toggleFilterBtns();

		// console.log('params',params);

		if (!increment){
			// Set the loading state
			// Which will hide the button, otherwise we want the button to be visible
			app.instance.setLoading.call(app.instance, app.instance.$articleList, true);
			// Clear the set
			collections.article_summaries.instance.set([]);
		} else {
			params.page = current_page + 1;
		}
		// Responsive articles will be added to `collections.article_summaries.instance`
		// `pagination and `total` information will be added as metadata on that collection
		collections.article_summaries.instance.fetch({data: params, remove: false})
			.then(function(model, status, response){
				// This is only called on success, error are caught by our listener above
				app.instance.setLoading.call(app.instance, app.instance.$articleList, false);
				app.instance.setLoadMoreButton.call(app.instance);
			});

		return this;
	},

	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');
			this.setLoading(this.$content, true);

			// Kill all subviews
			this.killAllSubviews();
			// Possibly replace this with
			collections.article_comparisons.instance.set([]);
			collections.article_detailed.instance.set([]);

			// Roll out section-secpfic code
			this.sectionMode[mode].call(this);

			// If we had some models already in a collection, we'll want to adjust their selection state
			// Do this after the sectionMode call so that all of our listeners are bound
			collections.article_summaries.instance.each(function(articleSummary){
				var section_selection_key = 'selected_for_' + mode,
						selected_for_section = articleSummary.get(section_selection_key);

				articleSummary.set('active_selected', selected_for_section);
			});

			return this;
		},
		compare: function(){

			var article_grid =  new views.ArticleComparisonGrid({collection: collections.dimensions.instance});
			// // Keep track of this view
			this._subviews.push(article_grid);
			// this._comparison_grid = article_grid;

			this.$content.html( article_grid.render().el );

			this.$listContainer = $('#compare-grid .rows');
			// Init isotope on the `$listContainer`
			var select_sorters = collections.dimensions.instance.formatSelectsForIsotope();
			app.helpers.isotope.initCntnr.call(this, select_sorters);

			// Set the sort on our comparison grid
			var initial_sort_by = collections.article_comparisons.instance.metadata('sort_by');
			var initial_sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');

			// And enable the toggle all and add to comparison buttons
			this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button')
				.prop('disabled', false)
				.parent()
					.removeClass('disabled');

			// Get the parameters by which we're sorting the comparisons
			var sort_by = collections.article_comparisons.instance.metadata('sort_by'),
					sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');
			$('.header-el').attr('data-sort-ascending', sort_ascending);

			// Set the compare view to the staged set of models
			// On load this will be json, but if we're coming from the detail view, we'll already have things so let's load those
			// On load `this.staged_article_comparisons` will be undefined so grab the ids of the article summaries
			// Unless we've been told to stop by an incoming route
			var staged_article_comparison_models;
			var compare_models;
			if (!this.pause_init){
				// console.log('setting headers',sort_by, sort_ascending)
				// This next line needs to be refactored so that data is being upated and the view reflects that
				// article_grid.sortBy.call(article_grid, initial_sort_by, initial_sort_ascending);
				collections.article_comparisons.instance.trigger('sortMetricHeaders');
				staged_article_comparison_models = this.staged_article_comparison_models || collections.article_summaries.instance.models;
				// var staged_article_comparison_models = this.staged_article_comparison_models || collections.article_summaries.instance.models;
				compare_models = this.comparison.loadRows(staged_article_comparison_models, this.saveHash); // Analagous to this.detail.loadPage excempt doesn't require fetching because article summaries are already loaded
				this.staged_article_comparison_models = staged_article_comparison_models;
				
			}

			return this;
		},
		detail: function(detailModelId){

			// We have `detailModelId` if we're coming from a summary drawer click
			// But if we're coming from a `.go-to-detail` click, changing modes triggers an update and thus we need to preload the model id under `staged_article_detail`
			detailModelId = detailModelId || this.staged_article_detail

			// Kill the toggle all button and add to replace buttons
			this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button').prop('disabled', true).parent().addClass('disabled');

			if (detailModelId){
				this.detail.loadPage.call(this, detailModelId, this.saveHash);
				this.setLoading(this.$content, false);
			} else {
				// this.killAllSubviews(); // Clear the comparison grid
				this.setLoading(this.$content, 'choose');
			}

			return this;
		}
	},

	toggleAllDrawer: function(e){
		var checked = $(e.currentTarget).find('input').prop('checked'),
				mode = models.section_mode.get('mode'),
				selected_for = 'selected_for_' + mode;

		collections.article_summaries.instance.each(function(summaryModel){
			// Persist and set mode
			if (mode == 'compare') {
				summaryModel.set(selected_for, checked);
			}
			summaryModel.set('active_selected', checked);
		});
		return this;
	},

	checkToggleState: function(){
		var drawer_collection = collections.article_summaries.instance,
				checked;
		
		var drawer_models = drawer_collection.length,
				selected = drawer_collection.where({selected_for_compare: true}).length;

		if (drawer_models && selected === drawer_models) {
			checked = true;
		} else {
			checked = false;
		}

		this.$toggleAllBtn.find('input').prop('checked', checked);

		return this;
	},

	drawer: {
		setActiveArticleSummaries: function(){
			// var current_filtered_set = views.po.article_summaries.getCurrentItems();
			// To maintain the correct sort order on the dom, we want to empty it
			collections.article_summaries.instance.set([]);
			// For changing the drawer list items based on filters
			collections.article_summaries.instance.set(current_filtered_set);
			app.instance.setLoadMoreButton.call(app.instance);

			// Make the checkboxes shift-selectable
			app.instance.$drawer.find('.drawer-list-outer').shiftSelectable();

			return this;

		},
		add: function(summaryModel){
			// Actions to take when adding an item to the drawer
			var item_view,
				item_el;

			item_view = new views.ArticleSummaryDrawer({model: summaryModel});
			item_el = item_view.render().el;
			this.$articleList.append(item_el);

			return this;
		},
		remove: function(summaryModel){
			// Actions to take when removing an item from the drawer
			summaryModel.trigger('destroy');
			return this;
		}

	},

	addToComparison: function(e){
		var $btn = $(e.currentTarget),
				action = $btn.attr('data-action'),
				sort_by,
				sort_ascending;

		// Only add items that are both selected and `in_drawer` which is `true` when it comes from a pourover filter
		var selected_models = collections.article_summaries.instance.where({selected_for_compare: true}),
				action;

		// Either replace or append
		if (action == 'replace'){
			action = 'set';
		} else if (action == 'add'){
			action = 'add';
		}

		collections.article_comparisons.instance[action](selected_models);

		// Persist these models by saving their ids
		this.staged_article_comparison_models = collections.article_comparisons.instance.slice(0);

		// Grab our params to sort from metadata elements on our collection
		sort_by = collections.article_comparisons.instance.metadata('sort_by')
		sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending')
		app.helpers.isotope.relayout(sort_by, sort_ascending);

		// console.log('adding to comparison')
		this.saveHash();

		return this;

	},

	comparison: {

		add: function(summaryModel) {
			// Actions to take when adding an item to the comparison grid
			var item_view,
				item_el;

			item_view = new views.ArticleSummaryRow({model: summaryModel, collection: collections.dimensions.instance});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$listContainer.append(item_el);
			app.helpers.isotope.addItem.call(app.instance, item_el);
			return this;
		},

		remove: function(comparisonModel) {
			comparisonModel.trigger('removeFromComparison');
			// comparisonModel.set('destroy', 'delete');
			// app.instance.saveHash();
			return this;
		},

		loadRows: function(stagedArticleComparisonModels, saveHash){

			if (stagedArticleComparisonModels.length){
				collections.article_comparisons.instance.set(stagedArticleComparisonModels);
			} else {
				app.instance.setLoading(app.instance.$content, 'none');
			}

			saveHash();

			return this;

		}
	},

	detail: {
		add: function(detailModel) {
			// Vars for baking account subject tags
			var item_view,
					item_el;

			// Actions to take when adding an item to the detail view
			item_view = new views.ArticleDetail({model: detailModel});
			this._subviews.push(item_view);


			item_el = item_view.render().el;
			this.$content.html(item_el);
			// This is called after the view has rendered instead of as a part of it because we're doing some dynamic layout calculation
			// If we did more harcoding of that then we could call it before it's appended to the DOM, but this way gives us more layout flexibility
			item_view.bakeInteractiveBits();

			return this;
		},
		remove: function(detailModel) {

			detailModel.trigger('destroyDetail');
			// detailModel.set('destroy', true);
			return this;
		},
		loadPage: function(detailModelId, saveHash){
			var that = this;

			// Could be in either one of these
			var summary_model = collections.article_summaries.instance.findWhere({id: detailModelId})
													|| collections.article_comparisons.instance.findWhere({id: detailModelId});

			// If that didn't get anything, then we're fetching, so set the fetch options
			var detail_model;
			if (!summary_model){
				var detail_model = new models.article_detailed.Model({id: detailModelId});

				detail_model.fetch().then(function(){
					collections.article_detailed.instance.set([detail_model]);
					saveHash();
				})
			} else {
				summary_model.set('active_selected', true);
				summary_model.set('selected_for_detail', true);
				// Call `.toJSON()` so that it will re-instantiate as the `article_detail` model
				collections.article_detailed.instance.set([summary_model.toJSON()]);

				saveHash();
				this.staged_article_detail = detailModelId;

			}

		},
	
	},

	saveHash: function(){
		var mode = models.section_mode.get('mode'),
				mode_collections = {
					compare: 'article_comparisons',
					detail: 'article_detailed'
				},
				mode_collection = mode_collections[mode];

		var article_ids = collections[mode_collection].instance.getHash();
		// Only add the trailing slash if there are ids that follow
		if (article_ids){
			article_ids = '/' + article_ids
		}

		// console.log('navigating')
		routing.router.navigate(mode + article_ids);
	},

	showHideList: function(e){
		var $btn = $(e.currentTarget),
				open = $btn.attr('data-open') == 'true',
				$list = $btn.parents('.option-container').find('.tag-list'),
				slide_duration = 400,
				text;

		if (open) {
			$list.slideUp(slide_duration, 'easeOutQuint');
			text = 'Show';
		} else {
			$list.slideDown(slide_duration, 'easeOutQuint');
			text = 'Hide';
		}

		$btn.attr('data-open', !open).html(text);

	},

	moreSummaryArticles: function(e){
		app.helpers.gifizeLoadMoreButton($(e.currentTarget));

		this.fetchByParameters(true);

		return this;
	},

	clearLoadMoreButton: function(){
		this.$drawer.find('.load-more').remove();
	},

	setLoadMoreButton: function(){

		// To be created and appended below, if we need it.
		var $loadMore;

		// Always kill the button
		this.clearLoadMoreButton();

		var article_summaries_collection = collections.article_summaries.instance;
		var pagination_info = article_summaries_collection.metadata('pagination');

		var current_page = pagination_info.page,
				page_size = pagination_info.per_page,
				total_pages = pagination_info.total_pages;

		var currently_loaded_count = article_summaries_collection.length,
				total_pending_for_search = article_summaries_collection.metadata('total');

		// Do we need the button
		var more_alerts_to_load = current_page < total_pages,
				remaining_alerts = total_pending_for_search - currently_loaded_count,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				text_str,
				button_str;

		text_str = 'Showing ' + currently_loaded_count + ' out of ' + total_pending_for_search;

		this.$articleCount.html(text_str);


		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMore = $('<button class="load-more" data-which="article-summaries"></button>');
			button_str = 'Load ' + to_load_string + ' more...'

			// Finally, append it as the last thing
			$loadMore.html(button_str).appendTo(this.$articleList);
		}

		return this;

	},

	updateComparisonMarker: function(e){
		var operation = $('.alter-comparison-marker[data-which="operation"]').val(),
				group     = $('.alter-comparison-marker[data-which="group"]').val();

		collections.article_comparisons.instance.metadata('operation', operation);
		collections.article_comparisons.instance.metadata('group', group);
		collections.article_comparisons.instance.redrawMarkers();

		return this;
	},

	onScrollTick: function($content){
		var that = this,
				stuck,
				buffer = 5,
				sticky_original_offset;
		// Vars to detect if at bottom
		var content_scrollHeight = $content[0].scrollHeight,
				content_scrollTop = $content.scrollTop();

		var $sticky = this.$el.find('.sticky');

		if ($sticky.length){
			sticky_original_offset = +$sticky.attr('data-offset');

			if (content_scrollTop >= sticky_original_offset - buffer) {
				stuck = true;
			} else {
				stuck = false;
			}
			$sticky.toggleClass('stuck', stuck);
		}
	},

	goToDetail: function(e){
		// Convert to number
		var article_id = +$(e.currentTarget).attr('data-id');
		
		// Make our target id what we clicked on 
		this.staged_article_detail = article_id;
		var current_mode = models.section_mode.get('mode');

		// If we aren't in detail mode, setting it will be enough to bring about a page change
		if (current_mode != 'detail') {
			models.section_mode.set('mode', 'detail');
		// Otherwise if we are in detail mode, then skip the prep part and load this model
		} else {
			// console.log('here', article_id)
			this.sectionMode.detail.call(this, article_id);
		}
		return this;
	},

	bakeArticleAdder: function(){
		var defaults = {};


		// Create an instance of an event creator view
		var add_article_view = new views.AddArticle({defaults: defaults, el: this.$addArticle[0], newModel: models.article_summary.Model});
		// this._subviews.push(add_article_view);
		this._time_picker = add_article_view._time_picker;
		return this;
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	updateTagContainerByCounts: function(){

		_.each(this.tag_list_els, function($el, key){
			var facet = models.tag_facets.get(key);
			if (facet){
				$el.find('.count').html(facet.length);
				var has_facet = facet.length > 0;
				$el.toggleClass('disabled', !has_facet);
			} else {
				var msg = 'ERROR: Missing facet in `models.tag_facets.` for key:' + key
				console.log(msg)
				console.log('`models.tag_facets` as JSON:', models.tag_facets.toJSON())
				console.log('Check what `pageData.tags` looks like. And see what is coming back on the `/content` get, which is where `facets` comes from')
				alert(msg + '\n See console out put for more info.')
			}

		}, this);

		return this;
	},

	clearFilters: function(e){
		var $clearBtn = $(e.currentTarget);
		var $optionContainer = $clearBtn.parents('.option-container');
		var is_visible = !($clearBtn.css('visibility') === 'hidden');

		// Only proceed if this button is visible
		if (is_visible){
			this.toggleFilterBtn($clearBtn, false);
			$optionContainer.find('.tag-wrapper.active').trigger('click');
		}

		return this;

	},

	toggleFilterBtn: function($clearBtn, show){
		var visible = (show) ? 'visible' : 'hidden';
		$clearBtn.css('visibility', visible);

		return this;
	},

	toggleFilterBtns: function(){
		_.each(this.tag_list_els, function($el, key){
			var $clearBtn = $el.find('.clear');
			// Do some massaging based on what our `data-type` and what the key under `models.content_item_filters` is
			// They differ bc the filter keys are what the api expects. 
			// TODO, This is a candidate for refactoring now that the API is stable
			if (/_tags/.test(key)){
				key = key.replace('_tags', '_tag_ids');
			}
			var group_active = models.content_item_filters.metadata(key);
			this.toggleFilterBtn($clearBtn, group_active);
		}, this);
		return this;
	}


});
app.Settings = Backbone.View.extend({
	el: '#main-wrapper',

	events: {
		'click .js-internal-link': 'setGlobalLoading',
		'click button.add': 'addItem'
	},

	initialize: function(){

		this._subviews = [];

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');

		this.default_recipes = {
			'rss-feeds': {
				view_name: 'SettingRssFeed',
				recipe_name: app.defaults.rss_feed_recipe_name,
				options: {
					template: templates.rssFeedRecipeFactory
				}
			},
			'staff-twitter-lists': {
				view_name: 'SettingStaffTwitterList',
				recipe_name: app.defaults.staff_twitter_list_to_promotion_recipe_name,
				options: {
					template: templates.staffTwitterListRecipeFactory
				}
			},
			'twitter-users': {
				view_name: 'SettingTwitterUser',
				recipe_name: app.defaults.staff_twitter_user_to_promotion_recipe_name,
				options: {
					template: templates.twitterUserRecipeFactory
				}
			},
			'facebook-pages': {
				view_name: 'SettingFacebookPage',
				recipe_name: app.defaults.staff_facebook_page_to_promotion_recipe_name,
				options: {
					template: templates.facebookPageRecipeFactory
				}
			},
			'subject-tags': {
				view_name: 'SettingSubjectTag'
			},
			'impact-tags': {
				view_name: 'SettingImpactTag'
			}
		};

		// Instantiate settings view
		this.render();

	},

	render: function(){

		// Bind user settings to inputs
		collections.user_settings.instance.each(function(userSetting){

			var user_setting_views = {
				email: {
					view: views.SettingSingle
				},
				password: {
					view: views.SettingPassword
				}
			};

			var user_settings = ['email', 'password'];

			user_settings.forEach(function(userSettingName){
				// Create a model outside of this collection so different settings keys can act independently, be validated independently but still relate to the same object
				// You might wonder, why put these in a collection to begin with
				// This could be refactored to make this just a list of different models to begin with but at least the overall pattern with this is more like other elements except for this line here
				var oSetting = new models.user_setting.Model(userSetting.toJSON())
				var setting_el = this.$content.find('.js-inputs-container[data-setting-name="'+userSettingName+'"]')[0];
				var setting_view = new user_setting_views[userSettingName].view({model: oSetting, el: setting_el, valueKey: userSettingName});
				this._subviews.push(setting_view);

			}, this);


		}, this);

		// Bind settings to inputs
		collections.settings.instance.each(function(orgSetting){
			var name = orgSetting.get('name');

			var setting_el = this.$content.find('.js-inputs-container[data-setting-name="'+name+'"]')[0];
			var setting_view = new views.SettingSingle({model: orgSetting, el: setting_el, valueKey: 'value'});
			this._subviews.push(setting_view);

		}, this);


		// Bind article recipes to inputs
		_.each(this.default_recipes, function(recipeInfo, recipeShorthand){
			var recipe_name = recipeInfo.recipe_name,
					recipe_models = collections.recipes.instance.where({name: recipeInfo.recipe_name});

			var $parent_el = this.$content.find('.js-inputs-container[data-setting-name="'+recipeShorthand+'"]');
			
			if (recipe_models.length){
				this.setGroupEmpty($parent_el.parents('.js-setting-group'), 'false');
			}

			recipe_models.forEach(function(recipeModel){
				var view_options = _.extend({
					model: recipeModel,
					parentEl: $parent_el[0]
				}, recipeInfo.options);

				var setting_view = new views[recipeInfo.view_name]( view_options );
				$parent_el.append(setting_view.el);
				this._subviews.push(setting_view);
			}, this);

		}, this);


		// Bind subject tags to inputs
		collections.subject_tags.instance.each(function(subjectTag){

			var $subject_tag_container = this.$content.find('.js-inputs-container[data-setting-name="subject-tags"]');
			var subject_tag_view = new views.SettingSubjectTag({model: subjectTag});
			$subject_tag_container.append(subject_tag_view.el);
			this._subviews.push(subject_tag_view);

		}, this);


		// Bind impact tags to inputs
		collections.impact_tags.instance.each(function(impactTag){

			var $impact_tag_container = this.$content.find('.js-inputs-container[data-setting-name="impact-tags"]');
			var impact_tag_view = new views.SettingImpactTag({model: impactTag});
			$impact_tag_container.append(impact_tag_view.el);
			this._subviews.push(impact_tag_view);

		}, this);


		return this;
	},

	setGroupEmpty: function($settingGroup, isEmpty){
		$settingGroup.attr('data-empty', isEmpty);

		return this;
	},

	addItem: function(e){
		var $btn = $(e.currentTarget),
				$settingGroup = $btn.parents('.js-setting-group'),
				is_empty = $settingGroup.attr('data-empty');

		// Make the `create` button turn into a `'+'` button
		if (is_empty === 'true'){
			this.setGroupEmpty($settingGroup, 'false')
		}

		var $inputsContainer = $btn.siblings('.js-inputs-container'),
				setting_name = $inputsContainer.attr('data-setting-name'),
				setting_view_info = this.default_recipes[setting_name],
				options = setting_view_info.options || {}

		var view = new views[setting_view_info.view_name]( options );

		$inputsContainer.append(view.el);
		this._subviews.push(view);

		return this;

	},

	reportError: function(msg){
		console.log('Error', msg);
		return false;
	}


});
app.Submit = Backbone.View.extend({
  el: '#main-wrapper',

  events: {
    'click .js-internal-link': 'setGlobalLoading',
    'submit form': 'saveForm'
  },

  initialize: function(){

    this._subviews = [];

    this.$formContainer = this.$el.find('#form-container');

    // Instantiate settings view
    this.render();

  },

  render: function(){

    var defaults = {
      status: 'pending'
    };

    var event_creator_view = new views.EventCreator({el: this.$formContainer[0], model: defaults, collection: this.collection, disableModal: true, saveMsg: 'Pending event added to the Approval River!'});
    this._subviews.push(event_creator_view);
    this._time_picker = event_creator_view._time_picker;


    return this;
  }

 

});
app.helpers = {

	drawer: {
		determineBehavior: function(){
			var behavior = 'radio';
			if (models.section_mode.get('mode') == 'compare') {
				behavior = 'checkbox';
			}
			return behavior;
		},
		getAllIds: function(){
			var ids = [];
			// Add all the ids in our loaded articles and set the hash to that
			_.each(this.drawerData, function(drawerDatum) { ids.push(drawerDatum[this.listId]) }, this);
			// Because we're finding the drawer item ids based on the detail items, we might have duplicates, such as in the approval river
			return ids;
		}
	},

	gifizeLoadMoreButton: function($loadMore){
		$loadMore.html('Loading... ').addClass('disabled').addClass('loading-spinner');
	},


	isotope: {
		initCntnr: function(dimensions){
			this.$isotopeCntnr = this.$listContainer;
			this.$isotopeCntnr.isotope({
				itemSelector: this.isotopeChild, 
				 masonry: {
		      columnWidth: 400
		    },	
				getSortData: dimensions
			});
		},
		clearCntnr: function(){
			if (this.$isotopeCntnr) this.$isotopeCntnr = null;
		},
		addItem: function($el){
			this.$isotopeCntnr.isotope('appended', $el);
			app.instance.setLoading(app.instance.$content, false);
		},
		relayout: function(sortBy, sortAscending){
			sortBy = sortBy || 'timestamp';
			if (_.isUndefined(sortAscending)) {
				sortAscending = false;
			}
			app.instance.$isotopeCntnr.isotope({sortBy: sortBy, sortAscending: sortAscending});
			app.instance.$isotopeCntnr.isotope('layout');

		}
	},

	exportData: {

		// singles: function(data, val){
		// 	return data[val];
		// }, 

		// // Assumes it has `id` and `name`-ish key, which can be passed in as optional third arg
		// objectLists: function(data, key, nameKey){
		// 	nameKey = nameKey || 'name'
		// 	return data[key].map(function(obj){
		// 		return [obj.id, obj[nameKey]].join(this.secondary)
		// 	}, this).join(this.primary);
		// }, 

		// metricsSingles: function(data, metricName){
		// 	return data.metrics[metricName]
		// },

		// metricsLists: function(data, metricName){
		// 	var metric_name_parts = metricName.split('|'), // This is a nested metric that we expanded. So we stored its parent name and then the facet name delimited by '|'
		// 			metric_name = metric_name_parts[0],
		// 			facet = metric_name_parts[1];

		// 	return _.findWhere(data.metrics[metric_name], {facet: facet}).value
		// }

	}

	// Used for prepping data for download and conversion into csv
	// flattenDataStructures: {
	// 	init: function(dict){
	// 		var converters = this;
	// 		var dict_of_json_ready_csvs = {}; // A dictionary where each key is a csv-compliant flat json list.
	// 		_.each(dict, function(value, key, object){
	// 			// Pass in the topLevelInfo so it can be added to each row. Not the most elegent but it lets us add the cleaned info onto every row in the data
	// 			var top_level_info;
	// 			if (dict_of_json_ready_csvs.topLevelInfo){
	// 				top_level_info = dict_of_json_ready_csvs.topLevelInfo[0];
	// 			}
	// 			dict_of_json_ready_csvs[key] = converters[key](value, top_level_info);
	// 		});
	// 		return dict_of_json_ready_csvs;
	// 	},
	// 	topLevelInfo: function(info){
	// 		// Convert the authors list from an array to a pipe-delimited string
	// 		info.article_datetime = helpers.templates.fullIsoDate(info.article_timestamp);
	// 		info.article_authors = info.article_authors.join('|');
	// 		info.article_subject_tags = info.article_subject_tags.map(function(tag){ return tag.name; }).join('|');
	// 		info.article_impact_tags = info.article_impact_tags.map(function(tag){ return tag.name; }).join('|');
	// 		info.article_impact_tag_categories = info.article_impact_tag_categories.map(function(tag){ return tag.name; }).join('|');
	// 		info.article_impact_tag_levels = info.article_impact_tag_levels.map(function(tag){ return tag.name; }).join('|');
	// 		info.article_links = info.article_links.join('|');
	// 		info.article_entities = info.article_entities.join('|');
	// 		info.article_keywords = info.article_keywords.join('|');
	// 		info.quant_metrics.forEach(function(quantMetric){
	// 			var metric = quantMetric.metric,
	// 					value = quantMetric.value;
	// 			info['article_total_'+metric] = value;
	// 		});
	// 		delete info.quant_metrics;
	// 		info.device_facets.forEach(function(deviceFacet){
	// 			var facet = deviceFacet.facet,
	// 					pageviews = deviceFacet.pageviews,
	// 					entrances = deviceFacet.entrances;
	// 			info['article_total_'+facet+'_pageviews'] = pageviews;
	// 			info['article_total_'+facet+'_entrances'] = entrances;
	// 		});
	// 		delete info.device_facets;
	// 		// The API doesn't filter these out so we do it here
	// 		var non_empty_social_facets = info.social_network_facets.filter(function(networkFacet){ return !_.isEmpty(networkFacet); })
	// 		non_empty_social_facets.forEach(function(networkFacet){
	// 			var facet = networkFacet.facet,
	// 					pageviews = networkFacet.pageviews,
	// 					entrances = networkFacet.entrances;
	// 			info['article_total_'+facet+'_pageviews'] = pageviews;
	// 			info['article_total_'+facet+'_entrances'] = entrances;
	// 		});
	// 		delete info.social_network_facets;
	// 		return [info];
	// 	},
	// 	tweets: function(tweets, topLevelInfo){
	// 		var flat_tweets = [],
	// 				top_level_info = _.pick(topLevelInfo, 'article_story_id');
	// 		// Flatten and remove extraneous elements from these tweet objects so they can each be a row in a csv
	// 		tweets.forEach(function(tweet){
	// 			var obj = {};
	// 			// Copy everything and then flatten the multi-dimensional elements
	// 			_.extend(obj, tweet);
	// 			obj.datetime = helpers.templates.fullIsoDate(tweet.timestamp);
	// 			obj.hashtags = obj.hashtags.join('|');
	// 			obj.img_urls = obj.img_urls.join('|');
	// 			obj.story_ids = obj.story_ids.join('|');
	// 			obj.urls = tweet.urls.join('|');
	// 			obj.user_mentions = tweet.user_mentions.join('|');
	// 			// Add top level info at the end
	// 			_.extend(obj, topLevelInfo);
	// 			flat_tweets.push(obj);
	// 		});
	// 		return flat_tweets;
	// 	},
	// 	timeseries: function(stats, topLevelInfo){
	// 		var augmented_stats = [],
	// 				top_level_info = _.pick(topLevelInfo, 'article_story_id');
	// 		stats.forEach(function(stat){
	// 			var obj = {};
	// 			// Copy everything and then add datetime
	// 			_.extend(obj, stat);
	// 			obj.datetime = helpers.templates.fullIsoDate(stat.timestamp);
	// 			// Add top level info at the end
	// 			_.extend(obj, top_level_info);
	// 			augmented_stats.push(obj);
	// 		});
	// 		return augmented_stats;
	// 	},
	// 	promotions: function(promotions, topLevelInfo){
	// 		var augmented_promotions = [],
	// 				top_level_info = _.pick(topLevelInfo, 'article_story_id');
	// 		promotions.forEach(function(promotion){
	// 			var obj = {};
	// 			_.extend(obj, promotion);
	// 			if (promotion.story_ids){
	// 				obj.story_ids = promotion.story_ids.join('|');
	// 			}
	// 			if (Array.isArray(obj.timestamp)){
	// 				obj.end_timestamp = obj.timestamp[1];
	// 				obj.timestamp = obj.timestamp[0];
	// 			}
	// 			if (Array.isArray(obj.urls)){
	// 				obj.urls = obj.urls.join('|');
	// 			}
	// 			obj.datetime = helpers.templates.fullIsoDate(promotion.timestamp);
	// 			_.extend(obj, top_level_info);
	// 			augmented_promotions.push(obj);
	// 		});
	// 		return augmented_promotions;
	// 	},
	// 	events: function(events, topLevelInfo){
	// 		var augmented_events = [],
	// 				top_level_info = _.pick(topLevelInfo, 'article_story_id');
	// 		events.forEach(function(evt){
	// 			var obj = {};
	// 			_.extend(obj, evt);
	// 			obj.impact_tag_categories = obj.impact_tag_categories.map(function(tag){ return tag.name; }).join('|');
	// 			obj.impact_tag_levels = obj.impact_tag_levels.map(function(tag){ return tag.name; }).join('|');
	// 			obj.impact_tags_full = obj.impact_tags_full.map(function(tag){ return tag.name; }).join('|');
	// 			obj.datetime = helpers.templates.fullIsoDate(evt.timestamp);
	// 			delete obj.impact_tags;
	// 			_.extend(obj, top_level_info);
	// 			augmented_events.push(obj);
	// 		});
	// 		return augmented_events;
	// 	},
	// 	comparisons: function(comparisons, topLevelInfo){
	// 		var transformed_comparisons = [],
	// 				top_level_info = _.pick(topLevelInfo, 'article_story_id');
	// 		_.each(comparisons, function(values, key){
	// 			var group_key = key;
	// 			// Temporary: comparisons API is returning null as a group
	// 			if (group_key == 'null'){
	// 				group_key = 'NA';
	// 			} else if (group_key != 'all'){
	// 				group_key = _.findWhere(pageData.subject_tags, {id: +key}).name;
	// 			}

	// 			values.forEach(function(value){
	// 				var obj = {};
	// 				_.extend(obj, value);
	// 				obj.group = group_key;
	// 				_.extend(obj, top_level_info);
	// 				transformed_comparisons.push(obj);
	// 			});
	// 		});
	// 		return transformed_comparisons;
	// 	}

	// }
}
routing = {
	Router: Backbone.Router.extend({
		initialize: function(section){
			// Stash an array of history states
			this.history = [];
			this.listenTo(this, 'route', function (name, args) {
				// For some reason, a second event is triggered where args is undefined, it could be a replacement call or something
				// For now, just ignore when undefined, when it's empty it's null
				if (!_.isUndefined(args[1])){
					this.history.push({
						name : name,
						mode : args[0],
						ids : args[1],
						fragment : Backbone.history.fragment
					});
				}
			});

			// Initialize the routes for this section
			routing.init[section].call(this);
			// And any common routes we want for every page
			routing.init.common.call(this);
		},
		loadRecipesAlerts: function(mode, recipe_id){
			if (recipe_id == 'manual'){
				recipe_id = -1;
			}
			recipe_id = +recipe_id;
			// `setModeOnly` is set to initialize the show all view of the recipe
			// We're going to trigger that manually right afterwards so we have this hacky variable to tell `ApprovalRiver.js` not to initialize the show all filter
			app.instance.pause_init = true;
			this.setModeOnly(mode);
			collections.recipes.instance.findWhere({id: recipe_id}).trigger('filter');
		},
		setModeOnly: function(mode){
			models.section_mode.set('mode', mode);
		},
		compareArticles: function(ids, sortBy, sortAscending){
			// Don't load the initial values
			app.instance.pause_init = true;

			var is_compare_mode = (models.section_mode.get('mode') == 'compare');

			ids = ids.replace(/\+/g, ',');

			sortAscending = JSON.parse(sortAscending);

			// var metrics_list = _.pluck(collections.dimensions.instance.cloneMetrics(), 'name');
			// var metric_str = (_.contains(metrics_list, sortBy)) ? 'metrics.' : '';

			var fetch_params = {
				ids: ids,
				sort_ids: true
				// sort: sort_ascending_str + metric_str + sortBy
			};

			// If already set this won't do anything
			models.section_mode.set('mode', 'compare');
			collections.article_comparisons.instance.metadata('sort_by', sortBy);
			collections.article_comparisons.instance.metadata('sort_ascending', sortAscending);
			collections.article_comparisons.instance.fetch({data: fetch_params}, {merge: true})
				.then(function(models){
					collections.article_comparisons.instance.setComparator(sortBy);
					collections.article_comparisons.instance.trigger('sortMetricHeaders');
					app.instance.staged_article_comparison_models = collections.article_comparisons.instance.slice(0);
					app.instance.pause_init = false;
				});

		},
		detailArticle: function(id){
			var is_detail_mode = (models.section_mode.get('mode') == 'detail');

			// Make sure this is a number
			id = +id;
			if (!is_detail_mode){
				app.instance.staged_article_detail = id;
				// This will trigger the rest of the view to load
				models.section_mode.set('mode', 'detail');
			} else {
				// .detail.loadPage(detailModelId, this.saveHash
				// If we're not in detail mode then setting it won't cascade those changes so we call this manually
				app.instance.detail.loadPage.call(app.instance, id, app.instance.saveHash)
				// app.instance.detail.getDetailModelFromId.call(app.instance, id, app.instance.detail.loadPage)
			}
		}

	}),
	helpers: {
		getMode: function(hash){
			return hash.split('/')[0].replace(/#/g,'');
		},
		getArticleIds: function(hash){
			// If it has a second index then it's true
			// If it's empty this will be undefined or ""
			return hash.split('/')[1];
		},
		exists: function(hash, articleId){
			var id_regex = new RegExp(articleId)
			return id_regex.test(hash);
		}
	}
}
templates.init = {
	articles: function(){
		this.tagFactory = _.template( $('#tag-templ').html() );
		this.articleSummaryDrawerFactory = _.template( $('#article-summary-drawer-templ').html() );
		this.drawerPointers = $('#drawer-pointers-templ').html();
		this.articleGridContainerFactory = _.template( $('#article-grid-container-templ').html() );
		this.articleSummaryRowFactory = _.template( $('#article-summary-row-templ').html() );
		this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
		this.articleDetailEventFactory = _.template( $('#article-detail-event-templ').html() );
		this.articleDetailTagFactory = _.template( $('#article-detail-tag-templ').html() );
		this.articleDetailAccountSubjectTagFactory = _.template( $('#article-detail-account-subject-tag-templ').html() );
	},
	"approval-river": function(){
		this.drawerMyRecipesPrepFactory 	= _.template( $('#drawer-my-recipes-templ').html() );
		this.drawerCreatePrep							=  $('#drawer-create-templ').html();
		this.alertFactory 								= _.template( $('#alert-templ').html() );
		this.recipeFactory 								= _.template( $('#recipe-templ').html() );
		this.recipeStaticFactory  				= _.template( $('#recipe-static-templ').html() );
		this.sousChefDrawerItemFactory 	  = _.template( $('#sous-chef-drawer-item-templ').html() );
		this.sousChefFormFactory		 			= _.template( $('#sous-chef-form-templ').html() );

	},
	settings: function(){
		this.inputActionsFactory = _.template( $('#input-actions-templ').html() );
		this.subjectTagFactory = _.template( $('#subject-tag-templ').html() );
		this.impactTagFactory = _.template( $('#impact-tag-templ').html() );
		this.rssFeedRecipeFactory = _.template( $('#rss-feed-templ').html() );
		this.staffTwitterListRecipeFactory = _.template( $('#staff-twitter-feed-templ').html() );
		this.twitterUserRecipeFactory = _.template( $('#twitter-user-templ').html() );
		this.facebookPageRecipeFactory = _.template( $('#facebook-page-templ').html() );
		this.modalFactory = _.template( $('#modal-templ').html() );
	},
	submit: function(){

	}
}

models.init = {
	articles: function(){
		// Keep track of the tag facet counts. Those views will listen to changes on this model to update themselves
		// Fetching new articles will update this model
		this.tag_facets = new models.generic.Model(pageData.tags.facets);
		this.content_item_filters = new models.filters.Model({sort_by: pageData.articleSummariesInfo.sort_by});
		this.comparison_metrics = new models.generic.Model(pageData.comparisonMetrics);
		// Keep track of whether we're in single view or comparison view
		this.section_mode = new models.generic.Model();

		// Create a model that we can use to fetch exports with
		this.exports = new models.exports.Model();

		// Create an empty object on this model to fill in later
		this.section_mode.compare = {};
	},
	"approval-river": function(){
		// Keep track of whether we're in `my-recipes or 'create-new' view
		this.section_mode = new models.generic.Model();
	},
	settings: function(){
		this.org.instance = new this.org.Model(pageData.org);
	},
	submit: function(){
		
	}
}

collections.init = {
	articles: function(){
		// Subject Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.tags.subject);
		// What the api query parameter key is
		this.subject_tags.instance.metadata('filter', 'subject_tag_ids');

		// Impact tags
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.tags.impact);
		// What the api query parameter key is
		this.impact_tags.instance.metadata('filter', 'impact_tag_ids');
		// Impact tag categories
		this.impact_tag_attributes.categories_instance = new this.impact_tag_attributes.Collection(pageData.tags.categories);
		this.impact_tag_attributes.levels_instance = new this.impact_tag_attributes.Collection(pageData.tags.levels);
		// Same as above
		// These meta fields are used on click to determine the filter to be applied
		this.impact_tag_attributes.categories_instance.metadata('filter', 'categories');
		this.impact_tag_attributes.levels_instance.metadata('filter', 'levels');

		// Because tags view instances can apply to both summary drawer filtering and event filtering
		// Stash a variable here to set up which `collections.po` collection to alter
		// `collections.po.article_summaries` or `collections.po.article_detailed_events`
		// this.subject_tags.instance.metadata('po_collection', 'article_summaries');
		// this.impact_tags.instance.metadata('po_collection', 'article_summaries');

		// Store our full dimensions list here and via metadata `selects`, pick out which ones we care about
		this.dimensions.instance = new this.dimensions.Collection(pageData.dimensionsInfo.dimensions);
		this.dimensions.instance.metadata('sort_by', pageData.dimensionsInfo.sort_by);
	
		// Article summaries
		this.article_summaries.instance = new this.article_summaries.Collection(pageData.articleSummariesInfo.response, {parse: true});

		// // This will populate the grid view based on our selection
		this.article_comparisons.instance = new this.article_comparisons.Collection([]);
		collections.article_comparisons.instance.metadata('sort_by', pageData.dimensionsInfo.sort_by);
		collections.article_comparisons.instance.metadata('sort_ascending', pageData.dimensionsInfo.sort_ascending);

		// Articles Detail
		// This is a collection of all our fetched detailed models
		// this.articles_detailed.instance = new this.articles_detailed.Collection();
		// This will choose the article to show in the detail view
		this.article_detailed.instance = new this.article_detailed.Collection();
		// What should its default viewing tab be?
		// TODO, also set this on initialize
		this.article_detailed.instance.metadata('selected-tab', 'life');
		// Tags
		// This is the collection of subject tags to be populated for each article detail page
		this.article_detailed_subject_tags.instance = new this.article_detailed_subject_tags.Collection();
		// And impact tags
		this.article_detailed_impact_tags.instance = new this.article_detailed_impact_tags.Collection();
		// Similarly, a list of impact tag categories
		this.article_detailed_impact_tag_attributes.categories_instance = new this.article_detailed_impact_tag_attributes.Collection();
		this.article_detailed_impact_tag_attributes.categories_instance.metadata('which', 'categories');
		// And even more similarly, a list of impact tag levels
		this.article_detailed_impact_tag_attributes.levels_instance = new this.article_detailed_impact_tag_attributes.Collection();
		this.article_detailed_impact_tag_attributes.levels_instance.metadata('which', 'levels');
	},
	"approval-river": function(){
		// Recipes
		// Make a collection of the recipes in this account
		var manual_recipe = {id: -1, name: 'Manually created', event_counts: {pending: pageData.manualEventsTotal}, sous_chef: 'manual-event', created: new Date().toString()};
		pageData.recipes.push(manual_recipe);
		this.recipes.instance = new this.recipes.Collection(pageData.recipes);
		// Recipes creators
		this.sous_chefs.instance = new this.sous_chefs.Collection(pageData.sousChefs);

		// This will later populate based on our selection of drawer items
		this.loaded_alerts.recipe_all_instance = new this.loaded_alerts.Collection(pageData.eventsInfo.events);
		this.loaded_alerts.recipe_all_instance.metadata('pagination', pageData.eventsInfo.pagination);
		this.loaded_alerts.recipe_all_instance.metadata('total', pageData.eventsInfo.total);

		// this.loaded_alerts.main_river_instance = new this.loaded_alerts.Collection(pageData.eventsInfo.events);
		this.active_alerts.instance = new this.active_alerts.Collection([]);

		// // // Keep track of the oldest item in this collection
		// this.loaded_alerts.instance.metadata('timestamp', pageData.alerts.min_timestamp);
	},
	settings: function(){
		// User and org settings
		this.user_settings.instance = new this.user_settings.Collection([pageData.user]);
		this.settings.instance = new this.settings.Collection(pageData.orgSettingsList);

		// Recipes
		this.recipes.instance = new this.recipes.Collection(pageData.recipes.all);

		// Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.tags.subject);
		this.impact_tags.instance  = new this.impact_tags.Collection(pageData.tags.impact);
	},
	submit: function(){
		// This has to exist in order to parse the created event, although I don't quite like this setup.
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.tags.impact);
	}
}

app.init = {
	articles: function(){

		this.instance = new this.Articles();
	},
	"approval-river": function(){

		// views.po.alerts = new PourOver.View('alerts', collections.po.alerts, {page_size: page_size });
		// views.po.alerts.setSort('timestamp_desc');

		this.instance = new this.ApprovalRiver();//({model: new models.generic.Model });
	},
	settings: function(){
		this.defaults = pageData.defaultRecipeNames;

		this.instance = new this.Settings();//({model: models.org.instance});
	},
	submit: function(){
		// Let's move towards not defining our collections globally
		var events_collection = new collections.article_detailed_events.Collection();
		this.instance = new this.Submit({collection: events_collection});
	}
}


routing.init = {
	go: function(section){
		this.router = new this.Router(section); // Pass the section to the `initialize` function, which will then call our sections specific routes
		Backbone.history.start();
	},
	common: function(){
		// If we've specified a starting route, then set it and trigger
		if (this.starting_route) {
			this.route('', function(){ 
				routing.router.navigate(this.starting_route, {trigger: true});
			});
		}
	},
	articles: function(){
		this.route(':mode', 'setModeOnly');
		this.route('compare/:ids?sort=:sort_by&asc=:asc', 'compareArticles');
		this.route('detail/:id', 'detailArticle');
		this.starting_route = 'compare';
	},
	"approval-river": function(){
		this.route(':mode', 'setModeOnly');
		this.route(':mode/:id', 'loadRecipesAlerts');
		this.starting_route = 'my-recipes';
	},
	settings: function(){
		// Nothing to see here folks, this page doesn't have any navigation
	},
	submit: function(){
		// Same
	}
}

var init = {
	go: function(){
		// Call the page specific functions
		var section = $('body').attr('data-section');
		// Their `this` should be the root object so you can still say `this.` even though you're nested in the object
		templates.init[section].call(templates);
		models.init[section].call(models);
		collections.init[section].call(collections);
		app.init[section].call(app);
		routing.init.go.call(routing, section);
	}
}

init.go();
