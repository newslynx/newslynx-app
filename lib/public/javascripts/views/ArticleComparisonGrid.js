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

		collections.article_comparisons.instance.comparator = function(articleComparison) { return articleComparison.get(metric) };
		if (!this.sortAscending){
			collections.article_comparisons.instance.comparator = this.reverseSortBy(collections.article_comparisons.instance.comparator);
		}
		collections.article_comparisons.instance.sort();
		console.log(collections.article_comparisons.instance.pluck('id'))
		app.instance.saveHash();
	},
	reverseSortBy: function(sortByFunction) {
		return function(left, right) {
			var l = sortByFunction(left);
			var r = sortByFunction(right);

			if (l === void 0) return -1;
			if (r === void 0) return 1;

			return l < r ? 1 : l > r ? -1 : 0;
		};
	}
})
