views.ArticleDetailVizDomainFacets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var ga_metrics = options.ga_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);


		var domain_facets_from_article = ga_metrics.ga_pageviews_by_domain,
				total_pageviews = ga_metrics.ga_pageviews;

		// Add display name as the same
		// And sort descending
		domain_facets_from_article = _.chain(domain_facets_from_article).each(function(facetInfo){
			facetInfo.facet_display_name = facetInfo.facet;
		}).sortBy(function(obj){
			return -obj.value
		}).value();

		this.data = domain_facets_from_article;
		this.total = total_pageviews;

		return this;
	}

});