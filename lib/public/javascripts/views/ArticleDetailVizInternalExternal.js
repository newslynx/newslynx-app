views.ArticleDetailVizInternalExternal = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var referrer_metrics = options.referrer_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);


		var entrances = referrer_metrics.total.entrances,
				pageviews = referrer_metrics.total.pageviews;

		// Get percentage for these later by dividing the facet by pageviews.
		this.data = [
			{
				facet: 'internal',
				pageviews: pageviews - entrances
			},
			{
				facet: 'external',
				pageviews: entrances
			}
		];

		// Which we'll store as total to be consistent with the other vizs
		this.total = pageviews;

		return this;
	}

});