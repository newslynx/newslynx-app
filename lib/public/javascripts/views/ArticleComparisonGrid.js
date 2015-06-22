views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){
		// var that = this;

		this.sortAscending = collections.article_comparisons.instance.metadata('sort_ascending');
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.setMetricHeaders);
		
		// views.po.article_summaries.on('sortChange', function(e,d,i){
		// 	var metric_arr = this.current_sort.name.split('_'), // `pageviews_desc`-> `pageviews TODO, later on when we sort by asc and descending, the secon item in the array can be passed to determine the sort order
		// 			metric = metric_arr.slice(0, metric_arr.length - 1).join('_'); // Get rid of the last element in the array, which will be `_desc` and then rejoin, so `avg_time_on_page_desc` becomes `avg_time_on_page` again
			
		// 	// a hack for now to standardize what our comparison grid column headers call these things
		// 	var crossover = {	
		// 		twitter_mentions: 'twitter',
		// 		facebook_likes: 'facebook',
		// 		subject_tags: 'subject',
		// 		impact_tags: 'impact'
		// 	};

		// 	var crossover_metric = crossover[metric];

		// 	if (crossover_metric) {
		// 		metric = crossover_metric;
		// 	}

		// 	that.sortFromPourOver.call(that, metric);
		// });
		// this.calcComparisonMarkerParams();

		// Grab the quant metrics

		// var quant_metrics = ['twitter', 'facebook', 'pageviews', 'avg_time_on_page', 'per_external'];
		// this.quant_metrics = this.hydrateMetrics(quant_metrics);
		return this;
	},

	sortFromPourOver: function(metric){
		// For now, pourover always gives you descending
		this.sortAscending = false;

		// If the metric is `per_internal` we're gonna do some trickery
		// We don't have a column for this because it's `100 - per_external` so we'll set `this.sortAscending = true` (blasphemy!) and sort by that metric
		if (metric == 'per_internal'){
			this.sortAscending = true;
			metric = 'per_external';
		}

		// Grab the metric from the PourOver view
		this.sortBy(metric);
		return this;
	},

	render: function(){
		var select_dimensions = _.extend({selects: this.collection.metadata('selects'), sort: this.collection.metadata('sort')}, helpers.templates.articles);
		var grid_markup = templates.articleGridContainerFactory( select_dimensions );

		this.$el.html(grid_markup);
		// this.setMetricHeaders();
		return this;
	},

	hydrateMetrics: function(quantMetrics){
		var group = this.comparison_marker_group;
		// TEMPORARY, remove total_time_on_page + internal
		var metric_maxes = pageData.articleComparisons[group].filter(function(metricMax){
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

		// Sorting
		var metric = $this.attr('data-metric');

		this.sortBy(metric);

		return this;

	},

	sortBy: function(metric){

		// Give active class to this header
		$('.header-el').removeClass('active');
		$('.header-el[data-metric="'+metric+'"]').addClass('active')

		app.instance.$isotopeCntnr.isotope({ sortBy : metric, sortAscending: this.sortAscending });

		// Stash our sorting options to be used on relayout
		collections.article_comparisons.instance.metadata('sort_ascending', this.sortAscending);
		collections.article_comparisons.instance.metadata('sort_by', metric);

		collections.article_comparisons.instance.comparator = function(articleComparison) { return articleComparison.get(metric); };
		// Adapted from this http://stackoverflow.com/questions/5013819/reverse-sort-order-with-backbone-js
		// Backbone won't sort non-numerical fields, `this.reverseSortBy` fixes that.
		if (!this.sortAscending){
			collections.article_comparisons.instance.comparator = this.reverseSortBy(collections.article_comparisons.instance.comparator);
		}
		// Force a sort in this new order since `sort` is only called when adding models
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
				display_dimension = dimension,
				display_dimension_abbreve = display_dimension;

		// Each quant metric corresponds to a column header, whose html and aria-label we want to set
		this.quant_metrics.forEach(function(quantMetric){
			var metric = quantMetric.metric,
					$header_el = this.$el.find('.header-el[data-metric="'+metric+'"] .comparison-figure'),
					value = quantMetric[dimension];

			// Format the number
			if (metric == 'per_external'){
				value = Math.round(value*100) + '%';
			} else {
				value = Math.round(value);
			}

			value = helpers.templates.addCommas(value);

			if (dimension == 'mean') {
				display_dimension = 'average';
				display_dimension_abbreve = 'avg';
			}

			display_dimension = helpers.templates.toTitleCase(display_dimension);
			display_dimension_abbreve = helpers.templates.toTitleCase(display_dimension_abbreve);

			value = '<span class="comparison-figure-dimension">'+display_dimension_abbreve+': </span>' + value;

			$header_el.html(value).attr('aria-label', display_dimension + ' of ' + group + ' articles.');
		}, this);
	}
})
