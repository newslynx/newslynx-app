collections.impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		url: '/api/tags/imact'
	})
}