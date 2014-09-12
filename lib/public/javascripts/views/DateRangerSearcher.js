views.DateRangeSearcher = Backbone.View.extend({

	events: {
		'click .clear-date-range': 'clearDateRange'
	},

	pikaday_options: {
		clearInvalidInput: true,
		onClear: function(){
			// Always clear our filter selection invalid date aka date deleted
			// I feel this is nice because then if you have an invalid date, you're not still filtering by some date range selection that you can no longer see
			collections.po.article_summaries.filters.timestamp.clearQuery();
			// Clear the min and max dates, it would be nice of `picker.clearDate()` did this;
			// https://github.com/dbushell/Pikaday/pull/134
			this.setMinDate();
			this.setMaxDate();
		}
	},

	initialize: function(){
		this.$clearDateRange = this.$el.find('.clear-date-range');
		// Make the two input boxes Pikaday intances
		// These have some slightly different behavior in their `onSelect` callback regarding max and min date setting so make them separate objects
		var that = this,
				start_opts = {
					field: this.$el.find('input[data-dir="from"]')[0],
					onSelect: function() {
						var thisDate = this.getDate();
						// On min date selection, set the max date for the end
						that.picker_end.setMinDate(thisDate);

						// Change the viewing range to the start date
						if (!that.picker_end.getDate()){
						  that.picker_end.gotoDate(thisDate);
						}
						that.filterByDate.call(that);
					}
				},
				end_opts = {
					field: this.$el.find('input[data-dir="to"]')[0],
					onSelect: function() {
						var thisDate = this.getDate();
						// On min date selection, set the max date for the end
						that.picker_start.setMaxDate(thisDate);

						that.filterByDate.call(that);
					}
				};
		// Add our options
		_.extend(start_opts, this.pikaday_options);
		_.extend(end_opts, this.pikaday_options);
		this.picker_start = new Pikaday( start_opts );
		this.picker_end = new Pikaday( end_opts );
	},

	clearDateRange: function(e){
		this.picker_start.clearDate(true);
		this.picker_end.clearDate(true);
		$(e.currentTarget).hide();
	},

	validateDates: function(){
		// Make sure both of them have dates
		// This also checks against them being strings and other nonsense
		return (this.picker_start.getDate() && this.picker_end.getDate())
	},

	filterByDate: function(){
		var valid_date_range = this.validateDates(),
				start_timestamp,
				end_timestamp;

		if (valid_date_range){
			collections.po.article_summaries.filters.timestamp.clearQuery();
			start_timestamp = this.picker_start.getDate().getTime()/1000;
			end_timestamp   = this.picker_end.getDate().getTime()/1000;
			collections.po.article_summaries.filters.timestamp.intersectQuery([start_timestamp, end_timestamp]);
			// Allow for clearing of date
			this.$clearDateRange.css('display','inline-block');
		}
	}

});