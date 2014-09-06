collections.article_detailed = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detailed.Model,
		url: 'api/articles/detail',
		set: function() {
			Backbone.Collection.prototype.set.apply(this,arguments);
			// Whenever we set an article on this model, also add it to `collections.articles_detailed.instance`
			Backbone.Collection.prototype.set.apply(collections.articles_detailed.instance,arguments);
		}
	})
}