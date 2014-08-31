// This is the model that holds our selected alerts
// If it is added to this collection, it's baked to the dom
// If it is removed from this collection, it's removed from the dom
collections.active_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/alerts',
		parse: function(response){
			// The structure of the response is {min_timetamp: <int>, results: <list> }
			// Store the timestamp on the collection and return the array of responses
			// Which will be set with `{remove: false}`
			this.metadata('min_timetamp', response.min_timetamp);
			return response.results;
		}
	})
}