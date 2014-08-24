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
		// this.merlynne = false;
	},

	render: function() {
		var river_item_markup = templates.recipeFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event');
		this.$submitMsg = this.$el.find('.submit-msg');
		if (this.model.get('set_default_event')) {
			this.$defaultEvents.show();
			this.showHideDefaults()
		}
		return this;
	},

	save: function(e){
		e.preventDefault();
		var that = this;
		var recipe_data = this.remodelRecipeJson();
		var new_recipe_creator_model = new models.recipe_creator.Model; 
		// this.merlynne = !this.merlynne
		// this.flashResult(this.merlynne)
		new_recipe_creator_model.save(recipe_data, {
			error: function(model, response, options){
				console.log('error in recipe creatin', response);
				that.flashResult('error');
			},
			success: function(model, response, options){
				console.log('saved recipe', response);
				that.flashResult(null);
			}
		});

	},

	flashResult: function(error){
		var animation_duration = 650;
		// TODO, make the animation better on submission
		if (!error){
			this.$el.css('background-color', '#D0F1D1').animate({'background-color': '#fff'}, animation_duration);
			this.render();
			this.printSubmitMsg(null, 'Recipe saved! Refresh your recipe list to see it.')
		} else {
			this.$el.css('background-color', '#FFD0D0').animate({'background-color': '#fff'}, animation_duration);
			this.printSubmitMsg('error', 'Meow! There was an error!');
		}
	},

	printSubmitMsg: function(error ,msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		this.$submitMsg.addClass(class_name).html(msg);
	},

	remodelRecipeJson: function(){
		var serializedArray = this.$form.serializeArray(),
				recipe_info = {
					source: this.model.get('source'),
					type: this.model.get('type'),
					set_default_event: this.model.get('set_default_event')
				};
		var model_json = views.helpers.remodelRecipeJson.create(recipe_info, serializedArray);
		return model_json;
	},

	toggleDefaults: function(){
		this.model.set('set_default_event', !this.model.get('set_default_event') )
	},

	showHideDefaults: function(){
		var open = this.model.get('set_default_event'),
				slide_duration = 350;
		if (open){
			this.$defautEventsBtn.html('Enabled').attr('data-status', 'true');
			this.$defaultEvents.slideDown(slide_duration, 'easeOutQuint');
		} else {
			this.$defautEventsBtn.html('Disabled').attr('data-status', 'false');
			this.$defaultEvents.slideUp(slide_duration, 'easeOutQuint');
		}
	}

});