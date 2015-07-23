views.ArticleDetailVizArticleReferrers = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var self = this;

		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);


		var domain_facets_from_article = ga_metrics.ga_pageviews_by_article_referrer,
				total_pageviews = ga_metrics.ga_pageviews;

		// Add display name as the same
		// And sort descending
		domain_facets_from_article = _.chain(domain_facets_from_article).each(function(facetInfo){
			facetInfo.facet_display_name = self.prettyPrintUrl(facetInfo.facet);
		}).sortBy(function(obj){
			return -obj.value
		}).value();

		this.data = domain_facets_from_article;
		this.total = total_pageviews;

		return this;
	},

	render: function(renderMarker){
		var self = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		var bar_container = _columns.append('div')
			.classed('bar-container', true);


		// Do the bullet
		bar_container.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.value / self.total)*100).toFixed(2) + '%';
				});

		bar_container.append('div')
					.classed('label', true)
					.classed('bar-text', true)
					.html(function(d){
						var percent = self.fancyPercent(d.value/self.total),
								count = (d.value) ? (helpers.templates.addCommas(d.value)) : ''; // Only print this string if count isn't zero

						return '<a href="http://'+d.facet+'" target="_blank">'+self.prettyPrintUrl(d.facet+'/mhkmhkmhkmhkmhkmhkmhkmhkmhkmhkmhkmhk')+'</a> &mdash; ' + percent+ ', ' + count;
					});


		this.bar_container = bar_container;

		return this;

	},

	prettyPrintUrl: function(url){
		// Strip out http
		url = url.replace(/(http|https):\/\//,'').replace(/^www./, '');
		// Bold domain
		url = url.replace(/([a-zA-Z0-9]([a-zA-Z0-9\-]{0,65}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/i, function(match){
			return '<span class="highlight">'+match+'</span>';
		});

		return url;

	}

});