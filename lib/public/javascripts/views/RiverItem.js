views.RiverItem = Backbone.View.extend({
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
		var river_item_markup = templates.riverItemFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(river_item_markup);
		return this;
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	saveModal: function(e){
		console.log('Saved');
		views.helpers.toggleModal(e);
		this.removeItem('save');
	},

	makeInsignificant: function(){
		this.removeItem('delete');
	},

	removeItem: function(mode){
		// Open up a modal that lets you assign it to something
		this.model.set('destroy', mode);
	},

	destroy: function(){
		var destroy_mode = this.model.get('destroy');
		// If it's a plain boolean, then remove it. That's used for switching drawer items
		if (destroy_mode === true) {
			if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
			else this.remove();
		}
		// If it's fancier, then it means we've gone through some dis/approval and we can have more options
		if (destroy_mode == 'delete') {
			// Add styles to fade out in red or something
			if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
			else this.remove();
		} else if (destroy_mode == 'save'){
			// Fade out in green or something
			if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
			else this.remove();
		}
	}

});