views.RecipeSchemaForm = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper mode-content',

	events: {
		'click .toggle-default-event': 'toggleDefaults',
		'submit form': 'save'
	},

	initialize: function(){
		this._subviews = [];
		this.listenTo(this.model, 'change:destroy', this.destroy);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);

		return this;
	},

	render: function() {
		var river_item_markup = templates.recipeSchemaFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup).attr('data-mode','create-new');
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event');
		this.$submitMsg = this.$el.find('.submit-msg');
		if (this.model.get('set_default_event')) {
			this.$defaultEvents.show();
			this.showHideDefaults();
		}

		this.postRender();
		return this;
	},

	postRender: function(){
		this.bakeRecipeCreator();

		return this;
	},

	bakeRecipeCreator: function(){
		var event_creator_view = new views.RecipeCreator({el: this.el, recipeSchema: this.model.toJSON()})
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view._time_picker;

		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;
	},

	save: function(e){
		e.preventDefault();
		var that = this;
		var set_default_event = $.extend(true, {}, this.model.get('set_default_event') );
		var recipe_data = $.extend(true, {}, this.event_creator_view.getSettings(set_default_event) );

		var model_data = this.model.toJSON();

		delete model_data.schema;

		if (set_default_event){
			model_data.default_event = {
					assignees: recipe_data.assignees,
					title: recipe_data.title,
					what_happened: recipe_data.what_happened,
					significance: recipe_data.significance,
					impact_tags: recipe_data.impact_tags
			}
		} else {
			model_data.default_event = {};
		}

		// Remove default events from main objects
		delete recipe_data.assignees;
		delete recipe_data.title;
		delete recipe_data.what_happened;
		delete recipe_data.significance;
		delete recipe_data.impact_tags;


		// Add name to outside of settings
		model_data.name = recipe_data.name;
		// remove it from the settings object
		delete recipe_data.name

		model_data.settings = recipe_data;
		// Clean up properites used in the UI
		delete model_data.viewing

		var new_recipe_creator_model = new models.recipe_creator.Model; 

		new_recipe_creator_model.save(model_data, {
			error: function(model, response, options){
				console.log('error in recipe creation', response);
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
		if (!error){
			this.$el.css('background-color', '#D0F1D1').animate({'background-color': '#fff'}, animation_duration);
			this._time_picker.destroy();
			// this.killAllSubviews();
			this.render();
			this.printSubmitMsg(null, 'Recipe saved! Refresh your recipe list to see it.');
		} else {
			this.$el.css('background-color', '#FFD0D0').animate({'background-color': '#fff'}, animation_duration);
			this.printSubmitMsg('error', 'Meow! There was an error!');
		}
	},

	printSubmitMsg: function(error, msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		// Fade out message, then make sure it's visible for the next time
		this.$submitMsg.addClass(class_name).html(msg).delay(3000).fadeOut(500).delay(750)
           .queue(function(next) { 
           	$(this).html('').removeClass(class_name).show();
           	next(); 
           })
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