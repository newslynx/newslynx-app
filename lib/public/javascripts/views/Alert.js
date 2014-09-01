views.Alert = Backbone.View.extend({
	tagName: 'div',

	className: 'article-detail-wrapper modal-parent',

	events: {
		'click .approval-btn-container[data-which="no"]': 'makeInsignificant',
		'click .approval-btn-container[data-which="yes"]': 'toggleModal',
		'click .cancel': 'toggleModal',
		'click .modal-overlay': 'toggleModal',
		'submit form': 'saveModal'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);
	},

	render: function() {
		var model_json = this.model.toJSON();
		var river_item_markup = templates.alertFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup);
		this.$el.attr('data-timestamp', model_json.timestamp);
		this.$form = this.$el.find('form');
		return this;
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	saveModal: function(e){
		e.preventDefault();
		var that = this;
		var alert_data = this.remodelFormJson();
		var new_event_model = new models.event.Model; 
		// console.log(alert_data);
		new_event_model.save(alert_data, {
			error: function(model, response, options){
				console.log('error in recipe creatin', response);
				// that.flashResult('error');
			},
			success: function(model, response, options){
				console.log('saved recipe', response);
				// that.flashResult(null);
				that.removeItem('save');
				views.helpers.toggleModal(e);
			}
		});

	},

	remodelFormJson: function(){
		var serializedArray = this.$form.serializeArray();
		var model_json = views.helpers.remodelEventJson(this.model.id, serializedArray);
		return model_json;
	},

	makeInsignificant: function(itemModel){
		var that = this;
		this.model.destroy({
    	success: function(model, response) {
				that.removeItem(true);

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

	destroy: function(){
		var destroy_mode = this.model.get('destroy');
		// If it's a plain boolean, then remove it. That's used for switching drawer items
		if (destroy_mode === true) {
			// TODO, this looks like it's doing the same thing as `delete` I might have changed that for testing, but it should go back
			if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); }
			else { this.remove(); }
		} else if (destroy_mode == 'delete') {
			// If it's fancier, then it means we've gone through some dis/approval and we can have more options
			// console.log('deeelete', this.$el)
			// Add styles to fade out in red or something
			if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ) }//.isotope('layout');
			else { this.remove(); }
		} else if (destroy_mode == 'save'){
			// Fade out in green or something
			if (app.instance.$isotopeCntnr) { app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); }
			else { this.remove(); }
		}
	}

});