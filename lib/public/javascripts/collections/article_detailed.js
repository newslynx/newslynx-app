collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		url: 'api/articles/detail',
		set: function() {
			Backbone.Collection.prototype.set.apply(this,arguments);
			console.log('here')
			this.updateHash();
			// Whenever we set an article on this model, also add it to `collections.articles_detailed.instance`
			Backbone.Collection.prototype.set.apply(collections.articles_detailed.instance,arguments);
		},
		updateHash: function() {
			this.hash = this.pluck('article_id').join('&');
		},
		getHash: function() {
			console.log(this.pluck('article_id').join('&'), this.hash)
			return this.hash; 
		}
	})
}