collections.all_detail_items = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.detail_item.Model,
		getTrue: helpers.modelsAndCollections.getTrue,
		zeroOut: helpers.modelsAndCollections.zeroOut,
		meta: helpers.modelsAndCollections.meta,
		filterAlerts: function(idKey, searchVal){
			var where_obj = {};
			where_obj[idKey] = searchVal;
			return this.where(where_obj);
		}
	})
}