views.ArticleDetailVizDeviceFacet = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		// this.calcComparisonMarkerParams();
		this.$el.attr('data-which', which);

		// Listen for marker redraw
		this.listenTo(collections.article_comparisons.instance, 'resetMetricHeaders', this.redrawMarker);

		// Bake device facets
		var device_facets = [
			{
				facet: "ga_pageviews_desktop",
				facet_display_name: "desktop",
				pageviews: 50000 // TEMPORARY until this gets filled in by API
			},{
				facet: "ga_pageviews_tablet",
				facet_display_name: "tablet",
				pageviews: 0
			},{
				facet: "ga_pageviews_mobile",
				facet_display_name: "mobile",
				pageviews: 0
			}
		];

		device_facets.forEach(function(deviceFacet){
			var metric_key = 'ga_pageviews_' + deviceFacet.facet;
			deviceFacet.pageviews = ga_metrics[metric_key] || deviceFacet.pageviews;
		});

		this.calcComparisonMarkerParams();

		this.data = device_facets;
		this.total = ga_metrics.ga_pageviews;

		return this;
	}

});