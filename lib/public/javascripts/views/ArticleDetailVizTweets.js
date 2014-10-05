views.ArticleDetailVizTweets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var tweets = options.tweet_info,
				title = options.title,
				which = options.which;

				console.log(tweets)

		this.section_title = title;
		this.setMarkup();
		this.$el.attr('data-which', which);

		this.data = tweets;

		return this;
	},

	// Override the base view's `render` function
	render: function(){
		var that = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _tweets = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		_tweets.append('div')
			.classed('tweet-container', true)
			.html(function(d){
				var html_without_script = d.html.replace('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>', '');
				return html_without_script;
			})

			// No idea why wrapping it in this works but it does
			// Hitting window.twttr.widgets.load(); should work without being in a setTimeout
			setTimeout(function(){
				window.twttr.widgets.load();
			}, 0);


		return this;	
	},

	ppUrl: function(url){
		// Strip out http
		url = url.replace(/(http|https):\/\//,'');
		// Bold domain
		url = url.replace(/[^w{3}\.]([a-zA-Z0-9]([a-zA-Z0-9\-]{0,65}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/i, function(match){
			return '<span class="highlight">'+match+'</span>';
		});

		return url;

	}

});