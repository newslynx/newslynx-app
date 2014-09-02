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
		updateHash: function() {
			this.hash = this.pluck('id').sort().join('&');
		},
		getHash: function() {
			return this.hash; 
		}
	})
}