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

		return this;

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

		return this;
	},

	bakeEventCreator: function(){

		var event_creator_view = new views.EventCreatorFromAlert({el: this.el, model: this.model.toJSON()});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view._time_picker;
		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;

	},

	toggleModal: function(e){
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

		var self = this; // `this` is the `alert` view

		var event_creator_view = this.event_creator_view,
		    form_data = event_creator_view.getSettings(),
		    form_info = event_creator_view.form_info;

    event_creator_view.setProcessing(e, true)
		event_creator_view.printMsgOnSubmit(false, '');

		this.event_creator_view.validate(form_info.schema, form_data, function(err, msg){
			if (!err){
				self.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on recipe edit', response);
						event_creator_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
				   recipe_editor_view.setProcessing(e, false)
					},
					success: function(model, response, options){
						console.log('Saved event', response);
						views.helpers.toggleModal(e);
						self.removeItem('save');
				   recipe_editor_view.setProcessing(e, false)
					}
				});
			} else {
				event_creator_view.printMsgOnSubmit(err, msg);
		    event_creator_view.setProcessing(e, false)
			}

		}, this);


		return this;

	},

	makeInsignificant: function(itemModel){
		var self = this;
		// When we destroy it, it removes it from the collection
		// Firing the remove event we have set up for page switching
		// We want to override that so it does our fade out
		// So set this additional bool as a gate
		// And check for it on destroy
		this.model.set('making_insignificant', true);
		// TODO, replace alert if fails
		self.removeItem('delete');
		this.model.destroy({
			// wait: true,
    	success: function(model, response) {

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
		var self = this,
				animation_duration = 500,
				color,
				height;
				
		if (mode == 'save'){
			color = '#D0F1D1';
		} else if (mode == 'delete'){
			color = '#FFD0D0';
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
				onAnimationEnd.call(self);
			});

		function onAnimationEnd(){
			this.event_creator_view._time_picker.destroy();
			this.killView();
		}
	}

});