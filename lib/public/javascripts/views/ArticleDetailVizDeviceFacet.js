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
				facet: "desktop",
				pageviews: 0
			},{
				facet: "tablet",
				pageviews: 0
			},{
				facet: "mobile",
				pageviews: 0
			}
		];

		device_facets.forEach(function(deviceFacet){
			var metric_key = 'ga_pageviews_' + deviceFacet.facet;
			deviceFacet.pageviews = ga_metrics[metric_key] || deviceFacet.pageviews;
		});

		console.log(device_facets)

		this.calcComparisonMarkerParams();

		this.data = device_facets;
		this.total = ga_metrics.pageviews;

		return this;
	}

});