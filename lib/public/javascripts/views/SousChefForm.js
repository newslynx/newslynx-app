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
		var event_creator_view = new views.RecipeCreator({el: this.el, sousChef: this.model.toJSON()})
		this._subviews.push(event_creator_view);

		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;
	},

	save: function(e){
		e.preventDefault();

		var that = this;

		var recipe_creator_view = this.event_creator_view,
				form_info = recipe_creator_view.form_info,
		    set_default_event = this.model.get('set_default_event'),
		    form_data = recipe_creator_view.getSettings(set_default_event);


		var new_recipe_creator_model = new models.recipe_creator.Model; 

		this.event_creator_view.validate(form_info.schema, form_data, function(err, msg){
			if (!err){
				// This could also be done through `collection.sync('create ...` but we already wrote this
				// and it gives more granularity for where we add this model to the recipe drawer collection
				new_recipe_creator_model.save(form_data, {
					error: function(model, response, options){
						var err = response.responseJSON;
						recipe_creator_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						that.render();
						that.flashSubmitMsg(false, 'Recipe saved!');
						// Give it some dummy stuff so it can appear in the drawer
						var id = response.id;
						model.set('event_counts', null);
						// TEMPORARY, this might be set on the server at some point
						model.set('set_default_event', set_default_event);
						model.set('id', id);
						// TEMPORARY, should this be ordered this way?
						// Add this as the second element in the array 
						collections.recipes.instance.add(model, {at: 0}); 
					}
				});
			} else {
				recipe_creator_view.printMsgOnSubmit(err, msg);
			}

		}, this);

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