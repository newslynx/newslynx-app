views.ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		'click .tab': 'switchTabs'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		this.chartSelector = '#ST-chart';

		this.formatDate = Date;
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
				var utc_date = new Date(d.timestamp*1000),
						user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.orgInfo.timezone) ));
				return user_timezone_date;
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
		var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(article_detail_markup);

		return this;
	},

	bakeInteractiveBits: function(){
		this.bakeChart();
		this.bakeEventGallery();
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

	switchTabs: function(e){
		var $tab = $(e.currentTarget),
				group,
				$target;

		// Only proceed if there is no active class
		if (!$tab.hasClass('active')){
			group   = $tab.attr('data-group');
			$target = $('.detail-section[data-group="'+group+'"]');
			// Update style on this tab
			this.$el.find('.tab').removeClass('active');
			$tab.addClass('active');

			// Hide other section
			$('.detail-section').hide();
			// Show the section we want
			$target.show();
		}
		return this;
	}


});
