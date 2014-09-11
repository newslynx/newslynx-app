views.ArticleSummaryDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer': 'updateSelected'
	},

	initialize: function(){
		this.updateActiveSelectionField();
		// Our drawer has two states, `compare` and `detail`
		// They should maintain whether they are selected under those conditions
		// So they have a selected property for each one `selected_for_comparison` and `selected_for_detail`
		// Therefore, listen for changes in `section_mode` and apply what our active selection property should point to
		this.listenTo(models.section_mode, 'change:mode', this.updateActiveSelectionField);
		this.listenTo(this.model, 'change:active_selected', this.setActiveCssState);
		this.listenTo(this.model, 'change:in_drawer', this.destroy);
	},

	render: function(){
		var drawer_list_item_markup = templates.articleSummaryDrawerFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		// Set the css on load to its default settings
		this.setActiveCssState();
		return this;
	},

	updateSelected: function(){
		var is_active = this.model.get('active_selected'),
				mode = this.selected_for,
				selected_for = 'selected_for_' + mode;

		if (mode == 'compare') {
			// Toggle
			is_active = !is_active;
		} else if (mode == 'detail' && !is_active) {
			// Radio set true IFF it isn't already
			is_active = true;
			collections.article_summaries.instance.where({'selected_for_detail': true}).forEach(function(articleSummary){
				// Change CSS and persist state
				articleSummary.set('active_selected', false).set('selected_for_detail', false);
			});
		}
		this.model.set('active_selected', is_active);
		// Persist user-initiated selections to the state
		this.model.set(selected_for, is_active);

		return this;
	},

	updateActiveSelectionField: function(model, mode){
		mode = mode || models.section_mode.get('mode');
		this.selected_for = mode;
	},

	setActiveCssState: function(){
		var selected = this.model.get('active_selected') || false, //Coerce `undefined` to `false`
				id = this.model.get('id');
				
		this.$el.find('.drawer-list-outer').toggleClass('active', selected);
		this.$el.find('.inputs-container input').prop('checked', selected);
		// Persist selected state onto pourover model
		_.findWhere(views.po.article_summaries.getCurrentItems(), {id: id}).selected = selected;
		return this;
	},

	destroy: function(mode, inDrawer){
		if (!inDrawer) {
			this.remove();
		}
	}



});