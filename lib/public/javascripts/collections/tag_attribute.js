collections.tag_attribute = {
	"categories_instance": null,
	"levels_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		metadata: helpers.modelsAndCollections.metadata
	})
}