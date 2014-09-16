views.ArticleDrawerSorter = Backbone.View.extend({

	events: {
		'change': 'setSortOnPoView'
	},

	initialize: function(){
		// Don't need to do anything on initialize
		this.$sorter = this.$el.find('select');
	},

	render: function(){
		// When we use this view on the approval river page we'll have it render a simple input[type="text"]
		// Or a more complicated multi-select dropdown
	},

	setSortOnPoView: function(e){
    var sort_value = this.$sorter.val();
		views.po.article_summaries.setSort(sort_value);
	}
});