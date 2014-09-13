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
		// this.listenTo(this.model, 'change:selected_for_compare', this.updateSelectedFromNonDrawerForCompare);
		this.listenTo(this.model, 'change:selected_for_detail', this.updateSelectedFromNonDrawer);
		this.listenTo(this.model, 'change:active_selected', this.setActiveCssState);
		this.listenTo(this.model, 'change:in_drawer', this.destroy);

	},

	render: function(){
		var drawer_list_item_markup = templates.articleSummaryDrawerFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		// Set the css on load to its default settings
		this.$subjectTagsContainer = this.$el.find('.subject-tags-container')
		this.$impactTagsContainer = this.$el.find('.impact-tags-container')
		this.setActiveCssState();
		this.addTags();
		return this;
	},

	updateSelected: function(){
		var is_active = this.model.get('active_selected'),
				mode = this.selected_for,
				selected_for = 'selected_for_' + mode;

		if (mode == 'compare') {
			// Toggle
			is_active = !is_active;
			this.model.set('active_selected', is_active);
			// And persist
			this.model.set(selected_for, is_active);
		} else if (mode == 'detail' && !is_active) {
			// Radio set true IFF it isn't already
			is_active = true;
			this.clearRadios();
			// Navigate to that page
			app.instance.staged_article_detail = this.model.get('id');
			app.instance.sectionMode.detail.call(app.instance);

		}
		// Set state
		// This is being called later on so even though it would be efficient to set it here, it would be duplicated later
		// It's being called later because the drawer item gets highlighted downstream of page detail activation
		// Even though in this case clicking the drawer is setting it in motion
		// That's because we have other entry points for setting detail articles
		// Set active

		return this;
	},

	clearRadios: function(id){
		collections.article_summaries.instance.where({'active_selected': true}).forEach(function(articleSummary){
			var deselecte_candidate_id = articleSummary.get('id');
			if (id != deselecte_candidate_id){
				// Set state
				articleSummary.set('active_selected', false);
				articleSummary.set('selected_for_detail', false, {silent: true});
			}
		});
	},

	updateSelectedFromNonDrawer: function(model, selectedForDetail){
		var id = model.get('id'),
				active_selected = model.get('active_selected');
		if (selectedForDetail){
			this.clearRadios(id);
			if (!active_selected) {
				this.model.set('active_selected', true);
			}
		}
	},

	// updateSelectedFromNonDrawerForCompare: function(model, isActive){
	// 	this.model.set('active_selected', isActive);
	// },

	updateActiveSelectionField: function(model, mode){
		mode = mode || models.section_mode.get('mode');
		this.selected_for = mode;
	},

	setActiveCssState: function(){
		var active_selected = this.model.get('active_selected') || false, //Coerce `undefined` to `false`
				selected_for_compare = this.model.get('selected_for_compare') || false,
				selected_for_detail = this.model.get('selected_for_detail') || false,
				id = this.model.get('id');

		this.$el.find('.drawer-list-outer').toggleClass('active', active_selected);
		this.$el.find('.inputs-container input').prop('checked', active_selected);
		// Persist selected state onto pourover model
		var po_model = _.findWhere(views.po.article_summaries.getCurrentItems(), {id: id});
		po_model.active_selected = active_selected;
		po_model.selected_for_compare = selected_for_compare;
		po_model.selected_for_detail = selected_for_detail;
		return this;
	},

	addTags: function(){
		var subject_tags_full = this.model.get('subject_tags_full'),
				impact_tags_full  = this.model.get('impact_tags_full');

		if (subject_tags_full.length) {
			this.$subjectTagsContainer.html('<span class="tag-list-title">Subj:</span>')
			subject_tags_full.forEach(function(subjectTag){
				var tag_model  = new models.subject_tag.Model(subjectTag);
				var tag_view = new views.ArticleSummaryDrawerSubjectTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this.$subjectTagsContainer.append(tag_markup);
			}, this);
		}


		// TODO, maybe make this view into a generic tag view or make a separate more specific impact view that shows level and category
		if (impact_tags_full.length) {
			this.$impactTagsContainer.html('<span class="tag-list-title">Imp:</span>')
			impact_tags_full.forEach(function(impactTag){
				var tag_model  = new models.subject_tag.Model(impactTag);
				var tag_view = new views.ArticleSummaryDrawerSubjectTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this.$impactTagsContainer.append(tag_markup);
			}, this);
		}


	},
	destroy: function(mode, inDrawer){
		if (!inDrawer) {
			this.remove();
		}
	}



});