collections.loaded_alerts = {
	"recipe_all_instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/events?status=pending&provenance=recipe', // TODO, allow for manual recipe approval with a custom recipe / recipe id of `manual`
		parse: function(eventsInfo){
			// ERROR this isn't replacing with new values
			this.metadata('paginaton', eventsInfo.pagination);
			this.metadata('total', eventsInfo.total);
			console.log('here')
			return eventsInfo.events;
		}
	})
}