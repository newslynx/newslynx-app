collections.article_comparisons = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_summary.Model,
		metadata: helpers.modelsAndCollections.metadata,
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
			options || (options = {});
		
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}

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
			console.log('rredrawe collection')
			this.models.forEach(function(model){
				// console.log(model)
				model.trigger('redrawMarker');
			});
		}
	})
}