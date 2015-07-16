views.ArticleDrawerSorter = Backbone.View.extend({

	events: {
		'change select': 'setSort',
		'click .sort-direction': 'toggleSortDir'
	},

	initialize: function(){
		// Don't need to do anything on initialize
		this.$sorter = this.$el.find('select');
		this.$direction = this.$el.find('.sort-direction');
		this.render();
	},

	render: function(){
		var sorterJson = this.collection.getSortableDimensions(),
				sort_by = collections.dimensions.instance.metadata('sort_by'); // This is our version without the `-`;

		var options_markup = sorterJson.map(function(sorterObj){
			var sort_name = sorterObj.sort_name,
					selected = (sort_name == sort_by || sort_name == ('metrics.'+sort_by) ) ? 'selected' : '',
					disabled = (sorterObj.disabled) ? 'disabled' : '';

			return '<option value="'+sort_name+'" '+selected+' '+disabled+'>'+helpers.templates.articles.prettyMetricName(sorterObj.name)+'</option>'
		}).join('');

		this.$sorter.append(options_markup);
	},

	setSort: function(){
    var val = this.$sorter.val();
    var direction = this.$direction.attr('data-dir') || '';
   	models.content_item_filters.set('sort_by', direction+val).trigger('filter');
	},

	toggleSortDir: function(){
		var direction = this.$direction.attr('data-dir');
		if (!direction){
			this.$direction.attr('data-dir', '-');
		} else {
			this.$direction.attr('data-dir', '');
		}

		this.setSort();
		return this;
		
	}


});