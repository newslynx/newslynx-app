collections.subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		url: '/api/tags/subject'
	})
}