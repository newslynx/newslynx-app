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
			this.metadata('delimiter', '+');

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
				var comparison_value = articleComparisonModel.get(dimensionName + '_full').length
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
			var delimiter = this.metadata('delimiter');
			
			var sort_by = this.metadata('sort_by'),
					ascending = this.metadata('sort_ascending');
					
			var query_params = '?sort=' + sort_by + '&asc=' + ascending;
			this.hash = this.pluck('id').join(delimiter) + query_params;
			this.hash_list = this.pluck('id')
		},
		// With optional delimiter
		getHash: function() {
			return this.hash
		},
		getHashList: function(delimiter) {
			var hash = this.hash_list
			delimiter = delimiter || this.metadata('delimiter')
			return hash.join(delimiter); 
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