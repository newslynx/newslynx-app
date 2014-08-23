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
		var river_item_markup = templates.recipeFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		this.$form = this.$el.find('form');
		return this;
	},

	save: function(e){
		e.preventDefault();
		var recipe_data = this.remodelRecipeJson();
		// var sa = this.$form.serializeArray()
		// var s = this.$form.serialize()
		// console.log(sa,s)
		// console.log(model_json);

	},

	remodelRecipeJson: function(){
		var serializedArray = this.$form.serializeArray(),
				recipe_info = {
					source: this.model.get('source'),
					type: this.model.get('type')
				};
		var model_json = views.helpers.remodelRecipeJson(recipe_info, serializedArray);
		console.log(model_json)

	}

});