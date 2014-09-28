views.ArticleDetailVizDomainFacets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var referrer_metrics = options.referrer_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);

		var domain_facets_from_article = referrer_metrics.ref_domain_facets,
				total_pageviews = referrer_metrics.total.pageviews;

		// TEMPORARY, API WILL EVENTUALLY DO THIS
		// TODO, remove this
		// Change `t` to `twitter`
		var twitter_facet = _.findWhere(referrer_metrics.ref_domain_facets, {facet: 't'});

		if (twitter_facet){
			twitter_facet.facet = 'twitter';
		}

		this.data = domain_facets_from_article.sort(function(a,b){
			return a.pageviews < b.pageviews
		});
		this.total = total_pageviews;

		return this;
	}

});