collections.article_detailed_events = {
	"Collection": Backbone.Collection.extend({
		model: models.event.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?facets=tags,categories,levels&status=approved&per_page=10&sous_chefs=!twitter-search-content-item-links-to-event', 
		parse: function(response){
			this.metadata('pagination', response.pagination);
			this.metadata('total', response.total);
			models.event_tag_facets.set(response.facets);
			return response.events;
		},
		comparator: function(eventItem){
			return eventItem.created;
		}

	})
}