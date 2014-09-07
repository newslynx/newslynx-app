views.ArticleSummaryDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'toggleSelected'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:selected', this.setActiveCssState);
		this.listenTo(this.model, 'change:in_drawer', this.destroy);
	},

	render: function(){
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
		var selected = this.model.get('selected'),
				id = this.model.get('id');
		if (selected){
			this.$el.find('.drawer-list-outer').toggleClass('active', this.model.get('selected'));
			this.$el.find('.inputs-container input').prop('checked', this.model.get('selected'));
		} else {
			this.$el.find('.drawer-list-outer').toggleClass('active', false);
			this.$el.find('.inputs-container input').prop('checked', false);
		}
		// Persist selected state onto pourover model
		_.findWhere(views.po.article_summaries.getCurrentItems(), {id: id}).selected = selected;
		return this;
	},

	destroy: function(mode, inDrawer){
		if (!inDrawer) {
			this.remove();
		}
	}



});