views.ArticleSearcher = Backbone.View.extend({

	events: {
		'keyup input': 'listenForKeyup',
		'click .clear': 'clearSearch'
	},

	initialize: function(){

		// Clear on load
		this.$input = this.$el.find('input');
		this.$clearBtn = this.$el.find('.clear');
		this.$input.val('');

		this.setSearchVal_debounced = _.debounce(this.setSearchVal, 250);

	},

	listenForKeyup: function(e){
		var val = this.$input.val();

		if (val){
			this.toggleClearBtn(true);
		} else {
			this.toggleClearBtn(false);
		}

		// Check if it's roughly a character key
		if (e.which !== 0){
			this.setSearchVal_debounced(val);			
		}

		return this;

	},

	setSearchVal: function(val){
		// console.log('search q', val);

		val = val || ''; // Coerce false to empty string
		if (val){
			// this.runBloodhound(val, this.addResultingCidsToFilter);
			models.content_item_filters.set('q', val);
		} else {
			models.content_item_filters.unset('q', val);
		}
		models.content_item_filters.trigger('filter');
		return this;
	},

	setSearchField: function(val){
		val = val || '';
		this.$input.val(val);
		this.setSearchVal(val);
	},

	clearSearch: function(){
		this.setSearchField(false);
		this.toggleClearBtn(false);

		return this;
	},

	toggleClearBtn: function(show){
		var visibility = (show) ? 'visible' : 'hidden';
		this.$clearBtn.css('visibility', visibility);

		return this;
	}

});