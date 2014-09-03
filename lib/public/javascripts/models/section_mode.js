models.section_mode = {
	"Model": Backbone.Model.extend({
		initialize: function(){
			var that = this;
			this.on('change', function() {
				var mode = this.get('mode'),
						current_ids = that.current_ids || false;

				if (!this[mode]) { this[mode] = {}; }
				// When changing modes, stash the current ids under a mode property
				// This can then be accessed when we switch into this mode to set the appropriate models
				this[mode].last_ids = current_ids;
			})
		}
	})
}