views.RecipeDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'filter',
		'click .enable-switch': 'toggleEnabled',
		'click .settings-switch': 'toggleModal',
		// 'click .drawer-list-outer:not(active)': 'setViewing',
		// 'click .cancel': 'toggleModal',
		// 'click .modal-overlay': 'toggleModal',
		// 'submit form': 'saveModal',
		// 'click .destroy': 'destroyModel',
		// 'click .toggle-default-event': 'toggleDefaults',
	},

	initialize: function(){
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

	// saveModal: function(e){
	// 	var that = this;
	// 	e.preventDefault();
	// 	var recipe_data = this.remodelRecipeJson();
	// 	this.model.save(recipe_data, {
	// 		error: function(model, response, options){
	// 			console.log('error in recipe update', response)
	// 			alert('Your update did not succeed. Please try again. Check the console for errors.')
	// 		},
	// 		success: function(model, response, options){
	// 			console.log('updated recipe', response);
	// 			// TODO, fancier animation on success
	// 			that.toggleModal(e);
	// 		}
	// 	});

	// 	return this;
	// },

	// destroyModel: function(e){
	// 	var that = this;
	// 	this.model.destroy({
	// 		success: function(model, response, options){
	// 			console.log('recipe destroyed', response);
	// 			// TODO, fancier animation on success
	// 			that.toggleModal(e);
	// 			that.$el.remove();
	// 		},
	// 		error: function(model, response, options){
	// 			console.log('error in model destroy', response)
	// 			alert('Your destroy did not work. Please try again. Check the console for errors.')
	// 		}
	// 	});

	// 	return this;
	// },

	// remodelRecipeJson: function(){
	// 	var serializedArray = this.$form.serializeArray(),
	// 			recipe_info = {
	// 				source: this.model.get('source'),
	// 				type: this.model.get('type'),
	// 				set_default_event: this.model.get('set_default_event')
	// 			};
	// 	var model_json = views.helpers.remodelRecipeJson.update(recipe_info, serializedArray);
	// 	return model_json;

	// 	return this;
	// },

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
	// radioSet: function(){
	// 	var id = this.model.get(app.instance.listId);
	// 	if ( !this.model.get('viewing') ){
	// 		// Clear the last active article
	// 		collections.drawer_items.instance.zeroOut('viewing');
	// 		// Also clear anything that was in the content area
	// 		app.helpers.itemDetail.removeAll();

	// 		// And set this model to the one being viewed
	// 		this.model.set('viewing', true);
	// 	} else if ( models.section_mode.get('mode') == 'my-alerts' ) {
	// 		// TODO, This should eventually be kicked into its own model that keeps track of filters more generally
	// 		$('.view-all').trigger('click');
	// 		id = 'all';
	// 	}
	// 	return this;
	// },

	// checkboxSet: function(){
	// 	// This section behaves like a checkbox
	// 	this.model.set('viewing', !this.model.get('viewing'));
	// 	return this;
	// },

	// setViewing: function(){
	// 	var viewing = this.model.get('viewing');
	// 	this.model.set('viewing', !viewing);
	// },

	// setHash: function(){
	// 	if (!this.modalOpen){
	// 		var behavior = app.helpers.drawer.determineBehavior();
	// 		// Call the appropriate behavior
	// 		routing.router.set[behavior]( this.model.get(app.instance.listId) );
	// 		return this;
	// 	}
	// }

});