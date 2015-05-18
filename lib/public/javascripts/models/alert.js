// This model gets a urlRoot when it's used to create an event from an alert
models.alert = {
	"Model": Backbone.Model.extend({
		urlRoot: 'api/_VERSION/alerts'
	})
}