collections.article_comparisons = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/content?facets=subject_tags,impact_tags,categories,levels',
		// Set our default options, these all correspond to keys in the article comparisons object. Essentially, what values should we pluck out of that to use as our comparison point
		initialize: function(){
			this.metadata('operation', 'mean');
			this.metadata('group', 'all');
			this.metadata('max', 'per_97_5');

			return this;
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
		// Also update hash on sort
		sort: function(options) {
			if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
			options = options || {};
		
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}
			console.log('id list',this.pluck('id'))

			if (!options.silent) this.trigger('sort', this, options);
			this.updateHash();
			return this;
		},
		updateHash: function() {
			this.hash = this.pluck('id').join('+');
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