views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){
		// var that = this;

		this.sortAscending = collections.article_comparisons.instance.metadata('sort_ascending');
		this.listenTo(collections.article_comparisons.instance, 'sortMetricHeaders', this.sortBy);
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

		// Cache our comparison parameters
		this.calcComparisonMarkerParams();

		var metrics = this.collection.cloneMetrics();
		this.metric_comparisons = this.addComparisonInfo(metrics);

		return this;
	},

	render: function(){
		var select_dimensions = _.extend({
				selects: this.collection.metadata('selects')
				// sort: this.collection.metadata('sort_by')
			}, 
			helpers.templates.articles
			);
		var grid_markup = templates.articleGridContainerFactory( select_dimensions );

		this.$el.html(grid_markup);
		this.setMetricHeaders();
		
		return this;
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // mean
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // all
		this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('max'); // per_97_5
		return this;
	},

	addComparisonInfo: function(metricsList){
		var group = this.comparison_marker_group;
		var full_group_comparison_metrics = models.comparison_metrics.get(group);
		

		metricsList.forEach(function(metricInfo){
			var comparison_data = _.findWhere(full_group_comparison_metrics, {metric: metricInfo.name}) || {};
			_.extend(metricInfo, comparison_data);
		});

		// // TEMPORARY, remove total_time_on_page + internal
		// var metric_maxes = pageData.articleComparisons[group].filter(function(metricMax){
		// 	return quantMetrics.indexOf(metricMax.metric) != -1; 
		// });

		// // Sort the quant data so it plots the right values for the headers
		// metric_maxes.sort(function(a,b){
		// 	return quantMetrics.indexOf(a.metric) - quantMetrics.indexOf(b.metric)
		// });
		// return metric_maxes;

		return metricsList;
	},

	sortColumn: function(e){
		var $this = $(e.currentTarget);

		// Only if we're clicking on an active header, reverse the sort order
		if ($this.hasClass('active')) {
			this.sortAscending = !this.sortAscending;
		}

		// Sorting
		var dimension_name = $this.attr('data-metric');

		// Stash our sorting options to be used on relayout
		collections.article_comparisons.instance.metadata('sort_ascending', this.sortAscending);
		collections.article_comparisons.instance.metadata('sort_by', dimension_name);
		collections.article_comparisons.instance.trigger('sortMetricHeaders');

		// this.sortBy(metric);

		return this;

	},

	// This function needs to be refactored to work off of a model change and not a UI click
	// It should get all values from the article_comparisons collection
	sortBy: function(){

		var self = this;

		var sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');
		var dimension_name = collections.article_comparisons.instance.metadata('sort_by');

		// Give active class to this header
		$('.header-el').removeClass('active');
		// TODO, standardize these data attribute names to `data-dimension`
		$('.header-el[data-metric="'+dimension_name+'"]').addClass('active');
		$('.header-el').attr('data-sort-ascending', sort_ascending);

		app.instance.$isotopeCntnr.isotope({ sortBy : dimension_name, sortAscending: sort_ascending });

		collections.article_comparisons.instance.setComparator(dimension_name);

		// Force a sort in this new order since `sort` is only called when adding models
		collections.article_comparisons.instance.sort();

		app.instance.saveHash();
	},

	setMetricHeaders: function(){
		// These were just changed so grab them again
		this.calcComparisonMarkerParams();

		var operation = this.comparison_marker_operation,
				group     = this.comparison_marker_group,
				display_operation = operation,
				display_operation_abbreve = display_operation;

		// Each quant metric corresponds to a column header, whose html and aria-label we want to set
		this.metric_comparisons.forEach(function(metricInfo){
			var metric_name = metricInfo.name,
					$header_el = this.$el.find('.header-el[data-metric="'+metric_name+'"] .comparison-figure'),
					value = metricInfo[operation];

			// console.log(metricInfo)

			// Format the number
			// TODO, this will be a `type` on the metric information
			// if (metric_name == 'per_external'){
			// 	value = Math.round(value*100) + '%';
			// } else {
			// 	value = Math.round(value);
			// }

			if (typeof value == 'number'){
				value = helpers.templates.addCommas(value);
			} else {
				console.log('WARNING: Could not find comparison value for: ', metric_name, 'For operation:', operation ,'In group:', group);
			}

			if (operation == 'mean') {
				display_operation = 'average';
				display_operation_abbreve = 'avg';
			}

			display_operation = helpers.templates.toTitleCase(display_operation);
			display_operation_abbreve = helpers.templates.toTitleCase(display_operation_abbreve);

			var markup = '<span class="comparison-figure-operation">'+display_operation_abbreve+': </span><span class="comparison-figure-value">' + value + '</span>';

			$header_el.html(markup).attr('aria-label', display_operation + ' of ' + group + ' articles.');
		}, this);
	}
})
