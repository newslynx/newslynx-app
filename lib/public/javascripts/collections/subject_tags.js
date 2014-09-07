collections.subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		metadata: helpers.modelsAndCollections.metadata,
		initialize: function(){
			this.metadata('filter', 'subject_tags');
			return this;
		}
	})
}