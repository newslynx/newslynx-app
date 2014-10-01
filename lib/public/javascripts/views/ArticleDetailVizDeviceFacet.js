views.ArticleDetailVizDeviceFacet = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var referrer_metrics = options.referrer_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.calcComparisonMarkerParams();
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

		var device_facets_from_article = referrer_metrics.device_facets,
				total_pageviews = referrer_metrics.total.pageviews;

		// `device_facets_model` is sparse so let's fill in any holes by copying the existing values over to the full and empty json object, overwriting `0`s
		device_facets.forEach(function(deviceFacet){
			var existing_val = _.findWhere(device_facets_from_article, {facet: deviceFacet.facet}),
					pageviews;
			if (existing_val) {
				pageviews = existing_val.pageviews
				deviceFacet.pageviews = pageviews;
			}
		});

		this.data = device_facets;
		this.total = total_pageviews;

		return this;
	}

});