views.ArticleDetailVizArticleReferrers = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var referrer_metrics = options.referrer_metrics,
				title = options.title,
				which = options.which;

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);

		var article_referrers_from_article = referrer_metrics.article_referrers;

		this.data = article_referrers_from_article;

		return this;
	},

	// Override the base view's `render` function
	render: function(){
		var that = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _links = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		_links.append('div')
			.classed('bar-text', true)
			.html(function(d){
				return '<a href="'+d+'" target="_blank">'+d+'</a>';
			});

		return this;
	}

});