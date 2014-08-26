views.LoadAllDrawerItems = Backbone.View.extend({

	events: {
		'click .view-all:not(.active)': 'setHash',
	},
	initialize: function(){
		// Update the button active state and the hash
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.$drawerListOuter = this.$el.find('.drawer-list-outer');
	},

	setHash: function(){
		routing.router.navigate('my-recipes', {trigger: true});
		return this;
	},

	setActiveCssState: function(){
		var active = this.model.get('viewing');
		this.$drawerListOuter.toggleClass('active', active);
		this.$drawerListOuter.find('input').prop('checked', active);
	}

});