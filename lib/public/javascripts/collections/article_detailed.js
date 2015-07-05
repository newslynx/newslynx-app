collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url:'/api/_VERSION/content',
		set: function() {
			// You could also set this up on the model and put the `hydrateTagsInfo` and `addTagInformation` functions on the model class
			// Which would be a little more organized since they apply to the model and not to a collection, but this is also clean since we're just correcting
			// A limitation of the json not returning full tag detail
			// Only do this if the thing coming in is a backbone model
			// var incoming_model = arguments[0][0];
			// If this isn't a backbone model it means it's not hyrdated
			// Another way to check for this would be to see if it has a `subject_tags_full` property
			// But because accessing attributes is different between backbone models and json objects, i.e. `.get` versus dot notation
			// You have to test further upstream
			// if (!(incoming_model instanceof Backbone.Model)){
			// 	arguments[0][0] = this.addTagInformation(incoming_model);
			// }
			// Always remove contents before setting so that we can set an existing model
			// Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
			this.updateHash();
			// // Whenever we set an article on this model, also add it to `collections.articles_detailed.instance`
			// I don't think we need this line anymore because these will already be stored in article_summaries
			// What we could somehow do is save all the fetched data on that model
			// This line would come after that view is fully rendered and all data is fetched
			// And those data objects would need to be added back to this model
			// And that model would check for those values on render
			// Marking this as a TODO for now
			// Backbone.Collection.prototype.add.apply(collections.articles_detailed.instance, arguments);
		},
		updateHash: function() {
			// This will just have one, unless we're doing a drawer change set which will empty
			if (this.length){
				this.hash = this.first().id;
			}
			// this.hash = this.pluck('id')[0];
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