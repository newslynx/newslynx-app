// This is the model that holds our selected alerts
// If it is added to this collection, it's baked to the dom
// If it is removed from this collection, it's removed from the dom
collections.active_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		initialize: function(){
			// TODO, better
			var pagination = {
				per_page: 25,
				page: 1
			};
			this.metadata('pagination', pagination);
			return this;
		},
		url: function(){
			console.log(this)
			var per_page = this.metadata('pagination').per_page;
			// Go to the next page
			var page_number = +this.metadata('pagination').page + 1;

			return 'api/_VERSION/events?status=pending&per_page='+per_page+'&page='+page_number;
		},
		parse: function(response){
			// The structure of the response is {min_timetamp: <int>, results: <list> }
			// Store the timestamp on the collection and return the array of responses to store as active_alerts
			// this.metadata('min_timetamp', response.min_timetamp);

			// Add the new stuff to our collection keeping track of everything
			collections.loaded_alerts.instance.add(response.events);
			this.metadata('total', response.total);
			this.metadata('pagination', response.pagination);

			console.log('here')

			return response.events;
		},
		comparator: function(alert){
			return alert.created;
		}
	})
}