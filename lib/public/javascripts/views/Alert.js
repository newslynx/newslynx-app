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

		// event_creator_view.$el.find('.form-row-input-container select,.form-row-input-container input,.form-row-input-container textarea').each(function(i,el){
		// 	var $el = $(el),
		// 			is_timestamp = $el.hasClass('timestamp');

		// 	if (!is_timestamp){
		// 		$el.trigger('change');
		// 	}
		// })
	},

	toggleModal: function(e){
		console.log('here')
		var $modalOuter = $(e.currentTarget).parents('.modal-parent').find('.modal-outer'),
				modal_opening = $modalOuter.css('display') == 'none';
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
		// Set the focus to the headline field on modal toggle open
		// TODO, could possibly be abstracted into a setting in the form, like, `put-focus`.
		if (modal_opening){
			$modalOuter.find('input[name="assignees-selector"]').focus();
		}
	},

	createEvent: function(e){
		e.preventDefault();
		// // console.log(this.event_data);
		// var settings_obj = this.event_creator_view.getSettings();
		// var new_event_model = new models.event.Model;

		// var required_keys = [
		// 		'timestamp',
		// 		'content_items',
		// 		'title',
		// 		'tag_ids'
		// 		];

		// var this_right_here = this;
		// this.event_creator_view.validate(required_keys, function(error, description){
		// 	var that = this;
		// 	if (!error){

		// 	new_event_model.save(settings_obj, {
		// 		error: function(model, response, options){
		// 			console.log('error in event creation', response);
		// 			that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
		// 		},
		// 		success: function(model, response, options){
		// 			console.log('saved event', response);

		// 			views.helpers.toggleModal(e);
		// 			this_right_here.removeItem('save');
		// 		}
		// 	});

		// 	} else {
		// 		this.printMsgOnSubmit(error, description);
		// 	}
		// });

	},

	makeInsignificant: function(itemModel){
		var that = this;
		// console.log(this.model.get('destroy'))
		// When we destroy it, it removes it from the collection
		// Firing the remove event we have set up for page switching
		// We want to override that so it does our fade out
		// So set this additional bool as a gate
		// And check for it on destroy
		this.model.set('making_insignificant', true);
		this.model.destroy({
			// wait: true,
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
		var making_insignificant = model.get('making_insignificant');
		// For now just destroy
		if (destroyMode == 'remove' && !making_insignificant){
			// this._time_picker.destroy();
			this.killView();
		} else if (destroyMode == 'delete'){
			this.removeAlertColorfully('delete')
		} else if (destroyMode == 'save') {
			this.removeAlertColorfully('save')
		}
	},

	removeAlertColorfully: function(mode){
		var that = this,
				animation_duration,
				color,
				height;
		if (mode == 'save'){
			color = '#D0F1D1';
			animation_duration = 1000;
		} else if (mode == 'delete'){
			color = '#FFD0D0';
			animation_duration = 500;
		}

		var height = this.$el.css('height') + 10;

		var animation_opts = {
			'width': 0,
			'opacity': 0,
			'margin-top': 0,
			'margin-right': 0,
			'height': 0,
			'margin-bottom': height
		};

		if ($(window).width() > 1260){
			animation_opts['padding-left'] = 0;
			animation_opts['padding-right'] = 0;
		} else {
			animation_opts['padding-bottom'] = 0;
			animation_opts['margin-bottom'] = 0;
		}

		this.$el.css({
				'background-color': color,
				'overflow': 'hidden',
				'white-space': 'nowrap'
			}).animate(animation_opts, animation_duration)
			.delay(0)
			.queue(function(next) { 
				onAnimationEnd.call(that);
			});

		function onAnimationEnd(){
			this.event_creator_view._time_picker.destroy();
			this.killView();
		}
	}

});