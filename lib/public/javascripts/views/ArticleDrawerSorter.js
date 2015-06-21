views.ArticleDrawerSorter = Backbone.View.extend({

	events: {
		'change': 'setSortOnPoView'
	},

	initialize: function(){
		// Don't need to do anything on initialize
		this.$sorter = this.$el.find('select');
		this.render();
	},

	render: function(){
		// When we use this view on the approval river page we'll have it render a simple input[type="text"]
		// Or a more complicated multi-select dropdown
		var options_markup = pageData.sorters.map(function(metric){
			return '<option value="'+metric.sort_name+'">'+metric.display_name+'</option>'
		}).join('');
		console.log(options_markup)
		this.$sorter.append(options_markup);
	},

	setSortOnPoView: function(e){
    var val = this.$sorter.val();
   	models.content_item_filters.set('sort', val).trigger('filter');
	}
});