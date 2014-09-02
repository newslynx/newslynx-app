views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){
		this.sortAscending = true;
	},

	render: function(){
		var grid_markup = templates.articleGridContainerMarkup;
		this.$el.html(grid_markup);
		return this;
	},

	sortColumn: function(e){
		var $this = $(e.currentTarget);
		// Styling
		$('.header-el').removeClass('active');
		$this.addClass('active');

		// Sorting
		var metric = $this.attr('data-metric');
		this.sortAscending = !this.sortAscending;
		app.instance.$isotopeCntnr.isotope({ sortBy : metric, sortAscending: this.sortAscending });

		// Stash our sorting options to be used on relayout
		collections.article_comparisons.instance.metadata('sort_ascending', this.sortAscending);
		collections.article_comparisons.instance.metadata('sort_by', metric);
	}
})
