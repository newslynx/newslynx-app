collections.all_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.river_item.Model,
		meta: helpers.modelsAndCollections.meta,
		filterAlerts: function(idKey, searchVal){
			var where_obj = {};
			where_obj[idKey] = searchVal;
			return this.where(where_obj);
		}
	})
}