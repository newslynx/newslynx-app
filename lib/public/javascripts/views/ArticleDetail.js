var ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		// click: 'addEvent'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		this.chartSelector = '#ST-chart';

		this.formatDate = d3.time.format('%Y-%m-%d %X');
		this.legend =	{
			facebook_likes: {service: 'Facebook', metric: 'likes', color: '#3B5998', group: 'a'},
			twitter_shares: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
			pageviews: {service: '', metric: 'pageviews', color: '#fc0', group: 'b'}
		}

		this.eventsData = this.model.toJSON().events;
		this.timeseriesData = this.model.toJSON().timeseries_stats;
		var that = this;

		this.spottedTail = spottedTail()
			.x(function(d) { 
				var utc_date = that.formatDate.parse(d.datetime),
						user_timezone_date = new Date(utc_date.setHours(utc_date.getHours() + parseFloat(pageData.org.timezone) ));
				return user_timezone_date
			})
			.y(function(d) { return +d.count; })
			.legend(this.legend)
			.eventSchema(pageData.eventSchemas)
			.events(this.eventsData)
			.onBrush(this.filterEventsByDateRange);
			// .notes(notes);

		},

	render: function(){
		// console.log(this.model.toJSON())
		var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), templates.helpers) );
		this.$el.html(article_detail_markup);

		return this;
	},

	bakeInteractiveBits: function(){
		this.bakeChart();
		this.bakeEventGallery
	},

	bakeChart: function(){
		d3.select(this.chartSelector)
			.datum(this.timeseriesData)
			.call(this.spottedTail);
	},

	bakeEventGallery: function(){

	},

	filterEventsByDateRange: function(dateRange){
		console.log(dateRange)
	},

	destroy: function(){
		if (this.model.get('destroy')) this.remove();
	}

});

modeule.exports = ArticleDetail;