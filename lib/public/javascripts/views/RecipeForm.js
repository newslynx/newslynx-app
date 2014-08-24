views.RecipeForm = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper mode-content',

	events: {
		'click .toggle-default-event': 'toggleDefaults',
		'submit form': 'save'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);
	},

	render: function() {
		var river_item_markup = templates.recipeFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event')
		return this;
	},

	save: function(e){
		e.preventDefault();
		var recipe_data = this.remodelRecipeJson();
		var new_recipe_creator_model = new models.recipe_creator.Model;
		console.log(recipe_data); 
		// new_recipe_creator_model.save(recipe_data, {
		// 	error: function(model, response, options){
		// 		console.log('error in recipe creatin', response)
		// 	},
		// 	success: function(model, response, options){
		// 		console.log('saved recipe', response);
		// 	}
		// });

	},

	remodelRecipeJson: function(){
		var serializedArray = this.$form.serializeArray(),
				recipe_info = {
					source: this.model.get('source'),
					type: this.model.get('type')
				};
		var set_default_event = this.model.get('set_default_event');
		var model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray, set_default_event);
		return model_json;
	},

	toggleDefaults: function(){
		this.model.set('set_default_event', !this.model.get('set_default_event') )
	},

	showHideDefaults: function(){
		var open = this.model.get('set_default_event');
		if (open){
			this.$defautEventsBtn.html('Enabled').attr('data-status', 'open');
		} else {
			this.$defautEventsBtn.html('Disabled').attr('data-status', 'closed');
		}
		this.$defaultEvents.toggle(open);

	}

});