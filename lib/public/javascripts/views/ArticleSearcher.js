views.ArticleSearcher = Backbone.View.extend({

	events: {
		'keyup': 'listenForKeyup_debounced'
	},

	initialize: function(){

		// Clear on load
		this.$el.val('');
		this.listenForKeyup_debounced = _.debounce(this.listenForKeyup, 250);
	},

	listenForKeyup: function(e){
		var val = this.$el.val();

		// Check if it's roughly a character key
		if (e.which !== 0){
			console.log('search q', val)
			// If we have some text, find matches and filter by those cids
			if (val){
				// this.runBloodhound(val, this.addResultingCidsToFilter);
				models.content_item_filters.set('q', val);
			} else {
				models.content_item_filters.unset('q', val);
				// all_cids = views.po.article_summaries.all_cids;
				// // If we don't have matches, add all cids to our filter, making it irrelevant
				// this.addResultingCidsToFilter(all_cids);
			}
			models.content_item_filters.trigger('filter');
			
		}

		return this;

	},

	// runBloodhound: function(val, cb){
	// 	app.bloodhound.get(val, function(suggestions){
	// 		var cids = _.pluck(suggestions, 'cid');
	// 		cb(cids);
	// 	});
	// },

	// addResultingCidsToFilter: function(cids){
 //    // Set the manualFilter to filter by these cids
 //    // `.query` replaces the existing cids
	// 	collections.po.article_summaries.filters.title.query(cids);
	// }
});