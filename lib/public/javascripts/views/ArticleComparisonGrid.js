views.ArticleComparisonGrid = Backbone.View.extend({

	tagName: 'div',

	className: 'compare-grid-container',

	events: {
		'click .header-el': 'sortColumn'
	},

	initialize: function(){

		this.sortAscending = collections.article_comparisons.instance.metadata('sort_ascending');
		this.listenTo(collections.article_comparisons.instance, 'sortMetricHeaders', this.sortBy);
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.setMetricHeaders);
		
		// Cache our comparison parameters
		this.calcComparisonMarkerParams();

		this.metric_comparisons = this.addComparisonInfo();

		return this;
	},

	render: function(){
		var select_dimensions = _.extend({
				selects: this.collection.metadata('selects')
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

	getComparisonGroup: function() {
		var group = this.comparison_marker_group
		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object_list;
		if (group == 'all'){
			comparison_object_list = models.comparison_metrics.get(group);
		} else {
			comparison_object_list = models.comparison_metrics.get('subject_tags')[group];
		}
		return comparison_object_list
	},

	addComparisonInfo: function(){
		var metrics_list = this.collection.cloneMetrics();

		var full_group_comparison_metrics = this.getComparisonGroup()

		metrics_list.forEach(function(metricInfo){
			var comparison_data = _.findWhere(full_group_comparison_metrics, {metric: metricInfo.name}) || {};
			_.extend(metricInfo, comparison_data);
		});

		return metrics_list;
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

		var dimension_name = collections.article_comparisons.instance.metadata('sort_by');
		var sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');

		// console.log(dimension_name)
		// console.log(sort_ascending)
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
		// Get our new comparison group data
		this.metric_comparisons = this.addComparisonInfo();

		var operation = this.comparison_marker_operation,
				group     = this.comparison_marker_group,
				display_operation = operation,
				display_operation_abbreve = display_operation;

		// Each quant metric corresponds to a column header, whose html and aria-label we want to set
		this.metric_comparisons.forEach(function(metricInfo){
			var metric_name = metricInfo.name,
					$header_el = this.$el.find('.header-el[data-metric="'+metric_name+'"] .comparison-figure'),
					value = metricInfo[operation];

			if (typeof value == 'number'){
				value = helpers.templates.addCommas(value);
			} else {
				console.log('WARNING: Could not find comparison value for: ', metric_name, 'For operation:', operation ,'In group:', group);
			}

			if (operation == 'mean') {
				display_operation = 'average';
				display_operation_abbreve = 'avg';
			}

			// If the group name is a number, it's a subject tag and the name needs fetching
			var group_name
			var tag_model
			if (group != 'all') {
				tag_model = collections.subject_tags.instance.findWhere({'id': +group})
				if (tag_model) {
					group_name = tag_model.get('name')
				}
			}
			group_name = group_name || group

			display_operation = helpers.templates.toTitleCase(display_operation);
			display_operation_abbreve = helpers.templates.toTitleCase(display_operation_abbreve);

			var markup = '<span class="comparison-figure-operation">' + display_operation_abbreve + ': </span><span class="comparison-figure-value">' + value + '</span>';

			$header_el.html(markup).attr('aria-label', display_operation + ' of ' + group_name + ' articles.');
		}, this);
	}
})
