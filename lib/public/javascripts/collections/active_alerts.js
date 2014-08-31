// This is the model that holds our selected alerts
// If it is added to this collection, it's baked to the dom
// If it is removed from this collection, it's removed from the dom
collections.active_alerts = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.alert.Model
	})
}