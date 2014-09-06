// This collection won't be making calls to the api
collections.article_detailed_impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model
	})
}