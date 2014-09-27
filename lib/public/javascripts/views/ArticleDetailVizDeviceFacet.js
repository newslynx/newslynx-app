views.ArticleDetailVizDeviceFacet = views.AA_BaseArticleViz.extend({

	// events: {
	// 	'click li': 'setMode'
	// },

	initialize: function(options){
		var referrer_metrics = options.referrer_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);

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
		]
		var device_facets_full = referrer_metrics.device_facets;

		var total = 0;

		// `device_facets_model` is sparse so let's fill in any holes by copying the existing values over to the full and empty json object, overwriting `0`s
		device_facets.forEach(function(deviceFacet){
			var existing_val = _.findWhere(device_facets_full, {facet: deviceFacet.facet}),
					pageviews;
			if (existing_val) {
				pageviews = existing_val.pageviews
				deviceFacet.pageviews = pageviews;
				total += pageviews;
			}
		});

		this.data = device_facets;
		this.total = total;

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
								count = (d.pageviews) ? ('(' + d.pageviews + ')') : ''; // Only print this string if count isn't zero
								
						return '<strong>' + helpers.templates.toTitleCase(d.facet) + '</strong> &mdash; ' + percent+ '% ' + count;
					})



		return this;

	}

});