collections.impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
    metadata: helpers.modelsAndCollections.metadata,
		url: function(){
			return '/api/_VERSION/tags'
		}
	})
}