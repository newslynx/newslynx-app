collections.loaded_alerts = {
	"recipe_all_instance": null, // One instance is creaeted for every recipe
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?status=pending&creates=events',
		parse: function(eventsInfo){
			this.metadata('pagination', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			console.log(eventsInfo);
			return eventsInfo.events;
		}
	})
}