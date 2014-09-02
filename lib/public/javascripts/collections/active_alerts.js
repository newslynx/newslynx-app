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
			// Store the timestamp on the collection and return the array of responses to store as active_alerts
			this.metadata('min_timetamp', response.min_timetamp);

			// Add the new stuff to our collection keeping track of everything
			collections.all_alerts.instance.add(response.results);

			return response.results;
		},
		comparator: 'timestamp'
	})
}