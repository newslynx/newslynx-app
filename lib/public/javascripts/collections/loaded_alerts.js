collections.loaded_alerts = {
	"recipe_all_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?status=pending',
		parse: function(eventsInfo){
			this.metadata('paginaton', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			return eventsInfo.events;
		}
	})
}