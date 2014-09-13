views.ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		'click .tab': 'switchTabs',
		'click .modal-toggle': 'toggleModal',
		'click .modal-close': 'toggleModal',
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		/* Setup Spotted Tail */
		this.chartSelector = '#ST-chart';

		this.legend =	{
			facebook_share_count: {service: 'Facebook', metric: 'shares', color: '#3B5998', group: 'a'},
			twitter_count: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
			pageviews: {service: '', metric: 'pageviews', color: '#ad00bd', group: 'b'}
		}

		this.eventsData = this.model.get('events');
		// This is a method and not just `this.model.get('timeseries_states')` because we can do some filtering and things to determine what slice of the data we want
		this.timeseriesData = this.model.getTimeSeriesStats();
		var that = this;

		this.spottedTail = spottedTail()
			.x(function(d) { 
				var utc_date = new Date(d.timestamp*1000),
						user_timezone_date = new Date(new Date(utc_date).setHours(utc_date.getHours() + parseFloat(pageData.orgInfo.timezone) ));
				return user_timezone_date;
			})
			.y(function(d) { return +d.count; })
			.legend(this.legend)
			.eventSchema(pageData.impactCategoriesInfo) // TEMPORARY, this should be a nesting of `impact_tags` and `impact_categories`
			.events(this.eventsData)
			.interpolate('step-after')
			.onBrush(this.filterEventsByDateRange);
		/* end spotted tail*/

	},

	render: function(){
		// console.log(this.model.toJSON())
		var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(article_detail_markup);

		return this;
	},

	bakeInteractiveBits: function(){
		this.$eventCreator = $('#event-creator-container');

		this.bakeChart();
		this.bakeEventGallery();
		/* Setup Event Creator */
		// We will pass the assignee into the event creator view so it can set that field
		var assignee = {
			id: this.model.get('id'),
			title: this.model.get('title')
		};

		// Create an instance of an event creator view
		new views.EventCreator({assignee: assignee, el: this.$eventCreator[0]});

		/* end event creator */

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
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	}


});
