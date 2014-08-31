collections.article_detaileds = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.article_detail.Model,
		url: 'api/articles/detail'
	})
}