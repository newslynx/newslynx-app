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
		this.total = pageviews

		return this;
	},

	render: function(){
		var that = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		_columns.append('div')
			.classed('bar-container', true)
			.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.pageviews / that.total)*100).toFixed(2) + '%';
				})
				.append('div')
					.classed('label', true)
					.html(function(d){
						var percent =  Math.round((d.pageviews/that.total)*100),
								count = (d.pageviews) ? ('(' + helpers.templates.addCommas(d.pageviews) + ')') : ''; // Only print this string if count isn't zero

						return '<strong>' + helpers.templates.toTitleCase(d.facet) + '</strong> &mdash; ' + percent+ '% ' + count;
					});


		return this;

	}

});