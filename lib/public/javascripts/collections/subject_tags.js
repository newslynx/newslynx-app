collections.subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: function(){
			return '/api/_VERSION/tags'
		}
	})
}