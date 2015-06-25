collections.article_detailed_events = {
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?facets=tags,levels&status=approved&per_page=5&creates=events', 
		parse: function(eventsInfo){
			this.metadata('pagination', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			console.log(eventsInfo.events,eventsInfo.events.length)	
			return eventsInfo.events;
		},
		comparator: function(eventItem){
			return eventItem.created;
		}

	})
}