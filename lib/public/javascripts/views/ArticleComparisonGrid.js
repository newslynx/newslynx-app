views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){
		this.sortAscending = collections.article_comparisons.instance.metadata('sort_ascending');
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.setMetricHeaders);
		this.calcComparisonMarkerParams();

		// Grab the quant metrics

		var quant_metrics = ['twitter', 'facebook', 'pageviews', 'avg_time_on_page'];
		// Get the `pageData.orgInfo`
		this.quant_metrics = this.hydrateMetrics(quant_metrics);
		return this;
	},

	render: function(){
		var grid_markup = templates.articleGridContainerMarkup;
		this.$el.html(grid_markup);
		this.setMetricHeaders();
		return this;
	},

	hydrateMetrics: function(quantMetrics){
		// TEMPORARY, remove total_time_on_page, internal and external
		var metric_maxes = pageData.orgInfo.metric_maxes.filter(function(metricMax){
			return quantMetrics.indexOf(metricMax.metric) != -1; 
		});

		// Sort the quant data so it plots the right values for the headers
		metric_maxes.sort(function(a,b){
			return quantMetrics.indexOf(a.metric) - quantMetrics.indexOf(b.metric)
		});
		return metric_maxes;
	},

	sortColumn: function(e){
		var $this = $(e.currentTarget);

		// Only if we're clicking on an active header, reverse the sort order
		if ($this.hasClass('active')) {
			this.sortAscending = !this.sortAscending;
		}
		// Styling
		$('.header-el').removeClass('active');
		$this.addClass('active');

		// Sorting
		var metric = $this.attr('data-metric');
		app.instance.$isotopeCntnr.isotope({ sortBy : metric, sortAscending: this.sortAscending });

		// Stash our sorting options to be used on relayout
		collections.article_comparisons.instance.metadata('sort_ascending', this.sortAscending);
		collections.article_comparisons.instance.metadata('sort_by', metric);

		collections.article_comparisons.instance.comparator = function(articleComparison) { return articleComparison.get(metric) };
		// Adapted from this http://stackoverflow.com/questions/5013819/reverse-sort-order-with-backbone-js
		// Backbone won't sort non-numerical fields, `this.reverseSortBy` fixes that.
		if (!this.sortAscending){
			collections.article_comparisons.instance.comparator = this.reverseSortBy(collections.article_comparisons.instance.comparator);
		}
		// Force a sort in this new order since sort is only called when adding models
		collections.article_comparisons.instance.sort();
		// app.instance.saveHash();

		$('.header-el').attr('data-sort-ascending', this.sortAscending);

	},
	reverseSortBy: function(sortByFunction) {
		return function(left, right) {
			var l = sortByFunction(left);
			var r = sortByFunction(right);

			if (l === void 0) return -1;
			if (r === void 0) return 1;

			return l < r ? 1 : l > r ? -1 : 0;
		};
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_dimension 	= collections.article_comparisons.instance.metadata('comparison-marker-dimension');
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('comparison-marker-group');
		this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('comparison-marker-max');
		return this;
	},

	setMetricHeaders: function(){
		this.calcComparisonMarkerParams();
		var dimension = this.comparison_marker_dimension,
				group     = this.comparison_marker_group,
				display_dimension = dimension;

		// d3.selectAll('.header-el.bullets .comparison-figure').data(this.quant_metrics).enter()
		// 	.transition()
		// 	.duration(200)
		// 	.html(function(d){
		// 		return Math.round(d[dimension]);
		// 	})
		// 	.attr('aria-label', function(d){
		// 		if (dimension == 'mean') { display_dimension = 'average'; }
		// 		display_dimension = helpers.templates.toTitleCase(display_dimension);
		// 		return display_dimension + ' of ' + group + ' articles.';
		// 	});

		// Each quant metric corresponds to a column header, whose html and aria-label we want to set
		this.quant_metrics.forEach(function(quantMetric){
			var $header_el = this.$el.find('.header-el[data-metric="'+quantMetric.metric+'"] .comparison-figure'),
					value = Math.round(quantMetric[dimension]);

			if (dimension == 'mean') {
				display_dimension = 'average';
			}

			display_dimension = helpers.templates.toTitleCase(display_dimension);

			$header_el.html(value).attr('aria-label', display_dimension + ' of ' + group + ' articles.');
		}, this);
	}
})
