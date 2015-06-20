// This is the model that holds our selected alerts
// If it is added to this collection, it's baked to the dom
// If it is removed from this collection, it's removed from the dom
collections.active_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events', // This doesn't need any query paremeters because it isn't used to fetch, just to delete or POST
		comparator: function(alert){
			return alert.created;
		}
	})
}