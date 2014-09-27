views.RecipeSchemaListItem = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	initialize: function(){

		return this;
	},

	render: function(){
		var drawer_list_item_markup = templates.recipeSchemaListItemFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		return this;
	}

});