views.RecipeDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'filter',
		'click .settings-switch': 'toggleModal',
		'click .toggle-default-event': 'toggleDefaults',
		'submit form': 'saveModal',
		'click .destroy': 'destroyModel'
	},

	initialize: function(){
		this._subviews = [];
		
		// // TODO temporary until this is added as a key on all recipes
		// this.model.set('set_default_event', this.model.hasDefaultEvent());

		this.listenTo(this.model, 'filter', this.filter);
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);

		return this;
	},

	render: function(){

		this.silenceAllSubviews();

		var drawer_list_item_markup = templates.recipeFactory( _.extend(this.model.toJSON(), helpers.templates) );

		this.$el.html(drawer_list_item_markup);
		this.$form = this.$el.find('form');

		this.$defaultEvents = this.$el.find('.default-event-container');
		this.$defautEventsBtn = this.$el.find('.toggle-default-event');
		this.$submitMsg = this.$el.find('.submit-msg');

		this.postRender();
		return this;
	},

	postRender: function(){
		this.bakeRecipeEditor();
	},

	bakeRecipeEditor: function(){
		var recipe_editor_view = new views.RecipeEditor({el: this.el, model: this.model.toJSON()})
		this._subviews.push(recipe_editor_view);

		this.$el.append(recipe_editor_view.el);
		this.recipe_editor_view = recipe_editor_view;

		return this;
	},

	filter: function(){
		var that = this,
				recipe_id = this.model.id;

		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, recipe_id);
		app.instance.show_all_view.deactivate();
		this.model.set('viewing', true);
		// Set the hash
		routing.router.navigate('my-recipes/'+recipe_id);

		return this;

	},

	// renderEnabled: function(model, enabled){
	// 	this.$el.find('.enable-switch')
	// 					.attr('data-enabled', enabled)
	// 					.html(helpers.templates.formatEnabled(enabled));

	// 	return this;
	// },

	toggleModal: function(e){
		this.killEvent(e);
		views.helpers.toggleModal(e);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();

		var that = this;

		var recipe_editor_view = this.recipe_editor_view,
		    set_default_event = this.model.get('set_default_event'),
		    form_data = recipe_editor_view.getSettings(set_default_event);

		var required_keys = recipe_editor_view.required_keys;

		this.recipe_editor_view.validate(required_keys, form_data, function(err, msg){
			if (!err){
				that.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on recipe edit', response);
						var err = response.responseJSON;
						// TODO, test
						recipe_editor_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model

						that.render();
						// Clear submit message
						recipe_editor_view.printMsgOnSubmit(false, '');
						// Close the modal
						that.toggleModal(e);
					}
				});
			} else {
				recipe_editor_view.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	},

	destroyModel: function(e){
		var that = this;
		this.model.destroy({
			success: function(model, response, options){
				console.log('recipe destroyed', response);
				// TODO, fancier animation on success
				that.toggleModal(e);
				that.$el.remove();
			},
			error: function(model, response, options){
				console.log('error in model destroy', response)
				alert('Your destroy did not work. Please try again. Check the console for errors.')
			}
		});

		return this;
	},

	// toggleEnabled: function(e){
	// 	this.killEvent(e);
	// 	this.model.set('enabled', !this.model.get('enabled'));
	// },

	killEvent: function(e){
		e.stopPropagation();
	},

	setActiveCssState: function(model, viewing){

		this.$el.find('.drawer-list-outer').toggleClass('active', viewing);
		this.$el.find('.inputs-container input').prop('checked', viewing);

		return this;
	},

	toggleDefaults: function(){
		this.model.set('set_default_event', !this.model.get('set_default_event') )
	},

	showHideDefaults: function(model, open){
		var slide_duration = 350;
		if (open){
			this.$defautEventsBtn.html('Enabled').attr('data-status', 'true');
			this.$defaultEvents.slideDown(slide_duration, 'easeOutQuint');
		} else {
			this.$defautEventsBtn.html('Disabled').attr('data-status', 'false');
			this.$defaultEvents.slideUp(slide_duration, 'easeOutQuint');
		}
	}


});