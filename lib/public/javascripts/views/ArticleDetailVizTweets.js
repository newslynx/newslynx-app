views.ArticleDetailVizTweets = views.AA_BaseArticleViz.extend({

	initialize: function(options){
		var tweets = options.tweets,
				title = options.title,
				which = options.which;

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
				d.meta.embed = d.meta.embed || '';
				var html_centered_without_script = d.meta.embed.replace('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>', '').replace('blockquote class="', 'blockquote class="tw-align-center ');
				return html_centered_without_script;
				return 'tweet'
			})

			// No idea why wrapping it in this works but it does
			// Hitting window.twttr.widgets.load(); should work without being in a setTimeout
			setTimeout(function(){
				window.twttr.widgets.load();
			}, 0);


		return this;	
	}


});