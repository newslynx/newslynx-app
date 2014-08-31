collections.all_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model,
		metadata: helpers.modelsAndCollections.metadata,
		filterAlerts: function(idKey, searchVal){
			var where_obj = {};
			where_obj[idKey] = searchVal;
			return this.where(where_obj);
		}
	})
}