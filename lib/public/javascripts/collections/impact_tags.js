collections.impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		url: '/api/tags/impact',
		metadata: helpers.modelsAndCollections.metadata,
		initialize: function(){
			this.metadata('filter', 'impact_tags');
			return this;
		}
	})
}