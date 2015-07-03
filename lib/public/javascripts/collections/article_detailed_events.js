collections.article_detailed_events = {
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?facets=tags,categories,levels&status=approved&per_page=2&creates=events', 
		parse: function(eventsInfo){
			this.metadata('pagination', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			models.event_tag_facets.set(eventsInfo.facets);
			return eventsInfo.events;
		},
		comparator: function(eventItem){
			return eventItem.created;
		}

	})
}