views.SousChefForm = Backbone.View.extend({

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
		var river_item_markup = templates.sousChefFormFactory( _.extend(this.model.toJSON(), helpers.templates) );
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

		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;
	},

	save: function(e){
		e.preventDefault();
		// var that = this;
		var set_default_event = this.model.get('set_default_event');
		var form_data = this.event_creator_view.getSettings(set_default_event);

		console.log(form_data)

		// delete recipe_data.description;
		// delete recipe_data.impact_tags;


		// // Add name to outside of settings
		// model_data.name = recipe_data.name;
		// // remove it from the settings object
		// delete recipe_data.name

		// model_data.settings = recipe_data;
		// // Clean up properites used in the UI
		// delete model_data.viewing

		// var new_recipe_creator_model = new models.recipe_creator.Model; 

		// var required_keys = _.keys(this.model.get('schema'))


		// // Remove the min_followers key, if it exists
		// // This isn't great because it applies to all recipes but it's what we got at this date.
		// var not_required_keys = ['min_followers'];
		// // required_keys = _.difference(required_keys, not_required_keys)
		// // TEMPORARY,
		// // Later on recipes will sometimes not require approval
		// required_keys = _.without(required_keys, 'requires_approval');

		// var this_right_here = this;
		// this.event_creator_view.validate(required_keys, function(error, description){
		// 	var that = this;
		// 	if (!error){
		// 		new_recipe_creator_model.save(model_data, {
		// 			error: function(model, response, options){
		// 				console.log('error in recipe creation', response);
		// 				this_right_here.flashSubmitMsg(false, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
		// 			},
		// 			success: function(model, response, options){
		// 				console.log('saved recipe', response);
		// 				that._time_picker.destroy();
		// 				this_right_here.render();
		// 				this_right_here.flashSubmitMsg(false, 'Recipe saved!');
		// 				// Give it some dummy stuff so it can appear in the drawer
		// 				var id = response.id;
		// 				model.set('pending',0)
		// 				model.set('id',id)
		// 				collections.recipes.account_instance.add(model, {at: 0}); // Add this as the first element in the array 
		// 			}
		// 		});
		// 	} else {
		// 		this.printMsgOnSubmit(error, description);
		// 	}
		// });

	},

	flashSubmitMsg: function(error, msg){
		var class_name = 'success';
		if (error) class_name = 'fail';
		this.$submitMsg.removeClass('success').removeClass('fail');
		// Fade out message, then make sure it's visible for the next time
		this.$submitMsg.addClass(class_name).html(msg).delay(7000).fadeOut(500).delay(750)
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