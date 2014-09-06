collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		url: 'api/articles/detail',
		set: function() {
			// Always remove contents before setting
			Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
			this.updateHash();
			// Whenever we set an article on this model, also add it to `collections.articles_detailed.instance`
			Backbone.Collection.prototype.set.apply(collections.articles_detailed.instance,arguments);
		},
		updateHash: function() {
			// This will just have one
			this.hash = this.pluck('id')[0];
		},
		getHash: function() {
			return this.hash; 
		}
	})
}