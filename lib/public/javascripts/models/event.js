models.event = {
	"Model": Backbone.Model.extend({
		urlRoot: '/api/_VERSION/events',

		parse: function(eventModel){
			var events_with_hydrated_tags = this.hydrateTags(eventModel);
			return events_with_hydrated_tags;
		},

		hydrateTags: function(eventModel){
			var hydrated_tags = eventModel.tag_ids.map(function(id){
				return collections.impact_tags.instance.findWhere({id: id});
			});
			eventModel.impact_tags_full = hydrated_tags;

			return eventModel;
		}

	})
}