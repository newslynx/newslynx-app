views.ArticleDetailVizInternalExternal = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.calcComparisonMarkerParams();
		this.$el.attr('data-which', which);

		// Listen for marker redraw
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.redrawMarker);

		var entrances = ga_metrics.ga_entrances,
				pageviews = ga_metrics.ga_pageviews;

		// Get percentage for these later by dividing the facet by pageviews.
		this.data = [
			{
				facet: 'ga_per_internal',
				facet_display_name: 'internal',
				value: pageviews - entrances
			},{
				facet: 'ga_per_external',
				facet_display_name: 'external',
				value: entrances
			}
		];

		// Which we'll store as total to be consistent with the other vizs
		this.total = pageviews;

		return this;
	}

});