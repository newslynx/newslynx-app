collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		set: function() {
			// You could also set this up on the model and put the `hydrateTagsInfo` and `addTagInformation` functions on the model class
			// Which would be a little more organized since they apply to the model and not to a collection, but this is also clean since we're just correcting
			// A limitation of the json not returning full tag detail
			// Only do this if the thing coming in is a backbone model
			var incoming_model = arguments[0];
			// If this isn't a backbone model it means it's not hyrdated
			// Another way to check for this would be to see if it has a `subject_tags_full` property
			// But because accessing attributes is different between backbone models and json objects, i.e. `.get` versus dot notation
			// You have to test further upstream
			if (!(incoming_model instanceof Backbone.Model)){
				arguments[0] = this.addTagInformation(incoming_model);
			}
			// // Always remove contents before setting
			Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
			this.updateHash();
			// // Whenever we set an article on this model, also add it to `collections.articles_detailed.instance`
			Backbone.Collection.prototype.add.apply(collections.articles_detailed.instance, arguments);
		},
		updateHash: function() {
			// This will just have one
			this.hash = this.pluck('id')[0];
		},
		getHash: function() {
			return this.hash; 
		},

		hydrateTagsInfo: helpers.modelsAndCollections.hydrateTagsInfo,

		addTagInformation: helpers.modelsAndCollections.addTagInformation


	})
}