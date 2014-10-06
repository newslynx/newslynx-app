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
		this.listenTo(this.model, 'filter', this.filter);
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);
		this.listenTo(this.model, 'change:set_default_event', this.showHideDefaults);

		return this;
	},

	render: function(){
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
		this._time_picker = recipe_editor_view.time_picker;

		this.$el.append(recipe_editor_view.el);

		this.recipe_editor_view = recipe_editor_view;

		return this;
	},

	filter: function(){
		var recipe_id = this.model.id;
		// Filter the alerts
		collections.po.alerts.filters.recipe_id.query(recipe_id);

		// And this will clear all other radio buttons, including show all
		app.instance.show_all_view.deactivate();
		this.model.set('viewing', true);

		// Set the hash
		routing.router.navigate('my-recipes/'+recipe_id);

		return this;

	},

	renderEnabled: function(model, enabled){
		this.$el.find('.enable-switch')
						.attr('data-enabled', enabled)
						.html(helpers.templates.formatEnabled(enabled));

		return this;
	},

	toggleModal: function(e){
		this.killEvent(e);
		views.helpers.toggleModal(e);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();
		var that = this;
		var set_default_event = this.model.get('set_default_event');
		var recipe_data 			= $.extend(true, {}, this.recipe_editor_view.getSettings(set_default_event) );

		var model_data = this.model.toJSON();

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

		console.log(this.model.toJSON())


		// Remove default events from main objects
		delete recipe_data.assignees;
		delete recipe_data.title;
		delete recipe_data.what_happened;
		delete recipe_data.significance;
		delete recipe_data.impact_tags;


		// Add name to outside of settings
		model_data.name = recipe_data.name;
		// // remove it from the settings object
		delete recipe_data.name

		model_data.settings = recipe_data;
		// Clean up properites used in the UI
		delete model_data.viewing;
		delete model_data.pending;



		this.model.save(model_data, {
			error: function(model, response, options){
				console.log('error in recipe update', response)
				alert('Your update did not succeed. Please try again. Check the console for errors.')
			},
			success: function(model, response, options){
				console.log('updated recipe', response);
				that.toggleModal(e);
			}
		});

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

	toggleEnabled: function(e){
		this.killEvent(e);
		this.model.set('enabled', !this.model.get('enabled'));
	},

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