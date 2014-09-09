views.ArticleTitleSearcher = Backbone.View.extend({

	events: {
		'keyup': 'listenForKeyup'
	},

	initialize: function(){
		// Don't need to do anything on initialize
	},

	render: function(){
		// When we use this view on the approval river page we'll have it render a simple input[type="text"]
		// Or a more complicated multi-select dropdown
	},

	listenForKeyup: function(){
		var val = this.$el.val(),
				all_cids;
		// If we have some text, find matches and filter by those cids
		if (val){
			this.runBloodhound(val, this.addResultingCidsToFilter);
		} else {
			all_cids = views.po.article_summaries.all_cids;
			// If we don't have matches, add all cids to our filter, making it irrelevant
			this.addResultingCidsToFilter(all_cids);
		}
	},

	runBloodhound: function(val, cb){
		app.bloodhound.get(val, function(suggestions){
			var cids = _.pluck(suggestions, 'cid');
			cb(cids);
		});
	},

	addResultingCidsToFilter: function(cids){
    // Set the manualFilter to filter by these cids
    // `.query` replaces the existing cids
		collections.po.article_summaries.filters.title.query(cids);
	}
});