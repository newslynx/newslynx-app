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
		var sorterModels = this.collection.models,
				sort_by = models.content_item_filters.get('sort');

		var options_markup = sorterModels.map(function(sorterModel){
			var sort_name = sorterModel.get('sort_name'),
					selected = (sort_name == sort_by) ? 'selected' : '';
			return '<option value="'+sort_name+'" '+selected+'>'+helpers.templates.articles.prettyMetricName(sorterModel.get('name'))+'</option>'
		}).join('');
		this.$sorter.append(options_markup);
	},

	setSortOnPoView: function(e){
    var val = this.$sorter.val();
   	models.content_item_filters.set('sort', val).trigger('filter');
	}
});