views.Alert = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper modal-parent',

	events: {
		'click .approval-btn-container[data-which="no"]': 'makeInsignificant',
		'click .approval-btn-container[data-which="yes"]': 'toggleModal',
		'submit form': 'createEvent'
		// 'change input': 'inputModified'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		this._subviews = [];
		this._time_picker;

		// Set some information about this view's form construction
		this.typeaheadInputId = 'assignees-selector';
	},

	render: function() {
		var model_json = this.model.toJSON();
		var river_item_markup = templates.alertFactory( _.extend(model_json, helpers.templates) );
		this.$el.html(river_item_markup);
		// this.$el.attr('data-timestamp', model_json.timestamp);
		this.$form = this.$el.find('form');

		this.postRender();

		return this;
	},

	postRender: function(){
		this.bakeEventCreator();
	},

	bakeEventCreator: function(){

		var event_creator_view = new views.EventCreatorFromAlert({el: this.el, model: this.model.toJSON()});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view.time_picker;
		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		event_creator_view.$el.find('.form-row-input-container select,.form-row-input-container input,.form-row-input-container textarea').each(function(i,el){
			var $el = $(el),
					is_timestamp = $el.hasClass('timestamp');

			if (!is_timestamp){
				$el.trigger('change');
			}
		})
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	createEvent: function(e){
		e.preventDefault();
		// console.log(this.event_data);
		var that = this;
		
		var settings_obj = this.event_creator_view.getSettings();
		var new_event_model = new models.event.Model;

		console.log('settings',settings_obj)

		new_event_model.save(settings_obj, {
			error: function(model, response, options){
				console.log('error in event creation', response);

			},
			success: function(model, response, options){
				console.log('saved event', response);

				views.helpers.toggleModal(e);
				that.removeItem('delete');
			}
		});
	},

	makeInsignificant: function(itemModel){
		var that = this;
		this.model.destroy({
    	success: function(model, response) {
				that.removeItem('delete');

			},
			error: function(error){
				console.log('Error deleting event.', error);
			}
		});
	},

	removeItem: function(mode){
		// Open up a modal that lets you assign it to something
		this.model.set('destroy', mode);
	},

	destroy: function(model, destroyMode){
		// For now just destroy
		// TODO, fade to green / fade to red
		if (destroyMode == 'remove'){
			// this._time_picker.destroy();
			this.killView();
		}else if (destroyMode == 'delete'){
			// this._time_picker.destroy();
			this.killView();
		} else if (destroyMode == 'save') {
			// this._time_picker.destroy();
			this.killView();
		}


		// // If it's a plain boolean, then remove it. That's used for switching drawer items
		// if (destroy_mode === true) {
		// 	// TODO, this looks like it's doing the same thing as `delete` I might have changed that for testing, but it should go back
		// 	if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); }
		// 	else { this.remove(); }
		// } else  if (destroy_mode == 'delete') {
		// 	// If it's fancier, then it means we've gone through some dis/approval and we can have more options
		// 	// Add styles to fade out in red or something
		// 	if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ) }//.isotope('layout');
		// 	else { this.remove(); }
		// } else if (destroy_mode == 'save'){
		// 	// Fade out in green or something
		// 	if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); }
		// 	else { this.remove(); }
		// }
	},

	
	// createEvent: function(e){
	// 	e.preventDefault();
	// 	// console.log(this.event_data);
		
	// 	var settings_obj = this.event_data;
	// 	var new_event_model = new models.event.Model;

	// 	console.log(settings_obj)

	// 	// new_event_model.save(settings_obj, {
	// 	// 	error: function(model, response, options){
	// 	// 		console.log('error in event creation', response);

	// 	// 	},
	// 	// 	success: function(model, response, options){
	// 	// 		console.log('saved event', response);

	// 	// 		views.helpers.toggleModal(e);
	// 	// 	}
	// 	// });
	// }

});