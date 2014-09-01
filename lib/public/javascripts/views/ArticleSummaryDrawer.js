views.ArticleSummaryDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'toggleSelected'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:selected', this.setActiveCssState);
		this.listenTo(this.model, 'change:destroy', this.destroy);
	},

	render: function(){
		console.log(this.model.toJSON())
		var drawer_list_item_markup = templates.articleSummaryDrawerFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		// Set the css on load to its default settings
		this.setActiveCssState();
		return this;
	},

	toggleSelected: function(){
		this.model.set('selected', !this.model.get('selected'));
		return this;
	},

	setActiveCssState: function(){
		var selected = this.model.get('selected');
		if (selected){
			this.$el.find('.drawer-list-outer').toggleClass('active', this.model.get('selected'));
			this.$el.find('.inputs-container input').prop('checked', this.model.get('selected'));
		} else {
			this.$el.find('.drawer-list-outer').toggleClass('active', false);
			this.$el.find('.inputs-container input').prop('checked', false);
		}
		return this;
	},

	destroy: function(){
		var destroy_mode = this.model.get('destroy');
		// If it's a plain boolean, then remove it. That's used for switching drawer items
		if (destroy_mode === true) {
			this.remove();
		}
	}



});