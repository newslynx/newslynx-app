views.DateRangeSearcher = Backbone.View.extend({

	events: {
		'click .clear': 'clearDateRange'
	},

	pikaday_options: {
		// clearInvalidInput: true,
			timezone: pageData.timezone,
		// onClear: function(){
		// 	// Always clear our filter selection invalid date aka date deleted
		// 	// I feel this is nice because then if you have an invalid date, you're not still filtering by some date range selection that you can no longer see
		// 	collections.po.article_summaries.filters.timestamp.clearQuery();
		// 	// Clear the min and max dates, it would be nice of `picker.clearDate()` did this;
		// 	// https://github.com/dbushell/Pikaday/pull/134
		// 	this.setMinDate();
		// 	this.setMaxDate();
		// }
	},

	initialize: function(){
		// Clear these form values, these might be left over if the page was refreshed and the browser is doing something fancy
		var $els = this.$el.find('input');
		$els.val('');

		this.$clearDateRange = this.$el.find('.clear');

		// Make the two input boxes Pikaday intances
		// These have some slightly different behavior in their `onSelect` callback regarding max and min date setting so make them separate objects
		var that = this;

		var $start_el = this.$el.find('input[data-dir="after"]');
		var $end_el   = this.$el.find('input[data-dir="before"]');
		
		var start_opts = {
			field: $start_el[0],
			onSelect: function() {
				var date_obj = this.getDate();

				var moment_timezone_date = this.getMoment(),
						pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

				// On min date selection, set the max date for the end
				that.picker_end.setMinDate(date_obj);

				// Change the viewing range to the start date
				if (!that.picker_end.getDate()){
				  that.picker_end.gotoDate(date_obj);
				}

				$start_el.val(pretty_date_string)

			},
			onClose: function(){
				if (!$start_el.val()){
					that.picker_end.setMinDate();
					this._d = '';
				}
				that.filterByDate.call(that);
			}
		};
		var end_opts = {
				field: $end_el[0],
				onSelect: function() {
					var date_obj = this.getDate();

					var moment_timezone_date = this.getMoment(),
							pretty_date_string = moment_timezone_date.format(helpers.templates.prettyDateTimeFormat); // June 23, 2014, 9:13 am

					// On min date selection, set the max date for the end
					that.picker_start.setMaxDate(date_obj);

					$end_el.val(pretty_date_string);

				},
				onClose: function(){
					if (!$end_el.val()){
						that.picker_start.setMaxDate();
						this._d = '';
					}
					that.filterByDate.call(that);
				}
			};
		// Add our options
		_.extend(start_opts, this.pikaday_options);
		_.extend(end_opts, this.pikaday_options);
		this.picker_start = new Pikaday( start_opts );
		this.picker_end = new Pikaday( end_opts );

		// this.$start_el = $start_el;
		// this.$end_el = $end_el;
		this.$els = $els
	},

	clearDateRange: function(e){
		this.picker_start._d = '';
		this.picker_end._d = '';
		this.$els.val('');
		$(e.currentTarget).css('visibility', 'hidden');
		this.filterByDate();
	},

	assembleValidDates: function(){
		// Make sure both of them have dates
		// This also checks against them being strings and other nonsense
		return [this.picker_start, this.picker_end].map(function(picker, index){
			var name = (index ? 'created_before' : 'created_after'),
			    date = picker.getDate();
			if (date) { 
				date = picker.getMoment().format();
			}
			return {name: name, value: date};
		});
	},

	filterByDate: function(){
		var dates = this.assembleValidDates(),
				start_timestamp,
				end_timestamp;

		// Setting or unsetting these values will trigger a change event which will construct filter parameters to the URl
		dates.forEach(function(dateInfo){
			if (dateInfo.value){
				models.content_item_filters.set(dateInfo.name, dateInfo.value);
				// // If we have at least one date set, then we'll be showing the clear button
				this.$clearDateRange.css('visibility','visible');
			} else {
				models.content_item_filters.unset(dateInfo.name, dateInfo.value);
			}
		}, this);
		// Do this manually do avoid double calls
		models.content_item_filters.trigger('filter');
	}

});