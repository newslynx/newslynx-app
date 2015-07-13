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