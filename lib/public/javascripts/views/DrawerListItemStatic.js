var views = views || {};
views.DrawerListItemStatic = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	initialize: function(){
		// this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		// this.listenTo(this.model, 'change:enabled', this.renderEnabled);
	},

	render: function(){
		var drawer_list_item_markup = templates.drawerListItemStaticFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);

		return this;
	},
});