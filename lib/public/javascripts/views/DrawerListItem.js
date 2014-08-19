var views = views || {};
views.DrawerListItem = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer': 'setHash',
		'click .enable-switch': 'toggleEnabled',
		'click .cancel': 'toggleModal',
		'click .settings-switch': 'toggleModal',
		'click .modal-overlay': 'toggleModal',
		'submit form': 'saveModal'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);
	},

	render: function(){
		var drawer_list_item_markup = templates.drawerListItemFactory( _.extend(this.model.toJSON(), templates.helpers) );
		this.$el.html(drawer_list_item_markup);

		return this;
	},

	renderEnabled: function(){
		var enabled = this.model.get('enabled');
		this.$el.find('.enable-switch')
						.attr('data-enabled', enabled)
						.html(templates.helpers.formatEnabled(enabled));
	},

	toggleModal: function(e){
		views.helpers.toggleModal(e)
	},

	saveModal: function(e){
		console.log('Saved');
		this.toggleModal(e);
	},

	toggleEnabled: function(e){
		e.stopPropagation();
		this.model.set('enabled', !this.model.get('enabled'));
	},

	setActiveCssState: function(model){
		var uids = routing.helpers.getArticleUids(window.location.hash);
		if (uids != 'all'){
			this.$el.find('.drawer-list-outer').toggleClass('active', model.get('viewing'));
			this.$el.find('.inputs-container input').prop('checked', model.get('viewing'));
		} else {
			this.$el.find('.drawer-list-outer').toggleClass('active', false);
			this.$el.find('.inputs-container input').prop('checked', false);
		}
		return this;
	},

	// radioSet: function(){
	// 	var uid = this.model.get(app.instance.listUid);
	// 	if ( !this.model.get('viewing') ){
	// 		// Clear the last active article
	// 		collections.drawer_items.instance.zeroOut('viewing');
	// 		// Also clear anything that was in the content area
	// 		app.helpers.itemDetail.removeAll();

	// 		// And set this model to the one being viewed
	// 		this.model.set('viewing', true);
	// 	} else if ( models.section_mode.instance.get('mode') == 'my-alerts' ) {
	// 		// TODO, This should eventually be kicked into its own model that keeps track of filters more generally
	// 		$('.view-all').trigger('click');
	// 		uid = 'all';
	// 	}
	// 	return this;
	// },

	// checkboxSet: function(){
	// 	// This section behaves like a checkbox
	// 	this.model.set('viewing', !this.model.get('viewing'));
	// 	return this;
	// },

	setHash: function(){
		var behavior = app.helpers.drawer.determineBehavior();
		// Call the appropriate behavior
		routing.router.set[behavior]( this.model.get(app.instance.listUid) );
		return this;
	}

});