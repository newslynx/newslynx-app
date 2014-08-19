var views = views || {};
views.RecipeForm = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper mode-content',

	events: {
		'submit form': 'save'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);
	},

	render: function() {
		var river_item_markup = templates.recipeFormFactory( _.extend(this.model.toJSON(), templates.helpers) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		return this;
	},

	save: function(){

	}

});