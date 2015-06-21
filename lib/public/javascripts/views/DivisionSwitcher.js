views.DivisionSwitcher = Backbone.View.extend({

	events: {
		'click li': 'setMode'
	},
	initialize: function(){
		// Update the button active state and the hash
		this.listenTo(this.model, 'change:mode', this.updateActiveState);
		this.updateActiveState();
	},

	setMode: function(e){
		// Only set it if it's different, i.e. doesn't have an `active` class
		// This doesn't make that much of a difference because we listen for change events
		// But it's still nice
		var $el = $(e.currentTarget);
		if (!$el.hasClass('active')){
			var mode = $el.attr('data-mode');
			this.model.set('mode', mode);
		}
		return this;
	},

	updateActiveState: function(model, mode){
		// Put a data attribute on the drawer for css purposes in the article view
		// This lets you have a different hover style when you hover over a checkbox article summary so you know you can do something to it
		$('#drawer').attr('data-mode', mode);
		$('#content').attr('data-mode', mode);
		console.log(mode)
		// Set the active state on the li
		this.$el.find('li').removeClass('active');
		this.$el.find('li[data-mode="'+mode+'"]').addClass('active');

		return this;
	}
});