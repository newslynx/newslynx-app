collections.article_detailed_subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		url: 'api/articles/:article_id/:mode/:tag_id'
	})
}