// This is the model for the view all button in the approval river
// It is currently its own model because the other models are one-to-one with recipes
// Setting `viewing` to `true` adds all alerts in memory into the `all_alerts` collection, which adds them to the dom
// models.all_alerts = {
// 	"Model": Backbone.Model.extend({
// 		defaults: {
// 			viewing: false
// 		}
// 	})
// }
// No longer used