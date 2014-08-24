views.RecipeForm = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper mode-content',

	events: {
		'click .toggle-default-event': 'toggleDefaults',
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
		var new_recipe_creator_model = new models.recipe_creator.Model;
		new_recipe_creator_model.save(recipe_data, {
			error: function(model, response, options){
				console.log('error in recipe creatin', response)
			},
			success: function(model, response, options){
				console.log('saved recipe', response);
			}
		});

	},

	remodelRecipeJson: function(){
		var serializedArray = this.$form.serializeArray(),
				recipe_info = {
					source: this.model.get('source'),
					type: this.model.get('type')
				};
		var model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray);
		return model_json;
	},

	toggleDefaults: function(e){
		var $btn = $(e.currentTarget)
		var open = $btn.html() == 'Enabled';
		console.log(open)
		if (open){
			$btn.html('Disabled').attr('data-status', 'closed');
		} else {
			$btn.html('Enabled').attr('data-status', 'open');
		}
		this.$el.find('.default-event-container').toggle(!open);
	}

});