views.ArticleSummaryDrawer = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer': 'toggleActive'
		// 'click .drawer-list-outer': 'updateSelected'
	},

	initialize: function(){
		// Keep track of views created by this view
		this._subviews = [];
		this.updateActiveSelectionField();

		// Our drawer has two states, `compare` and `detail`
		// They should maintain whether they are selected under those conditions
		// So they have a selected property for each one `selected_for_compare` and `selected_for_detail`
		// Therefore, listen for changes in `section_mode` and apply what our active selection property should point to
		this.listenTo(models.section_mode, 'change:mode', this.updateActiveSelectionField);
		
		this.listenTo(this.model, 'change:active_selected', this.setActiveCssState);

		// Use this to make this field act as a binary across the collection
		this.listenTo(this.model, 'change:selected_for_detail', this.setDetailDrawerDisplay);

		// Listen for a destroy event 
		this.listenTo(this.model, 'destroy', this.destroy);

		// Add an event listener sot hat this model can be set on and off without being clicked on
		this.listenTo(this.model, 'toggleElement', this.toggleActive);

	},

	render: function(){
		var drawer_list_item_markup = templates.articleSummaryDrawerFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		// Set the css on load to its default settings
		this.$subjectTagsContainer = this.$el.find('.subject-tags-container');
		this.$impactTagsContainer = this.$el.find('.impact-tags-container');

		this.addTags();
		
		this.setActiveCssState();
		return this;
	},

	updateActiveSelectionField: function(model, mode){
		mode = mode || models.section_mode.get('mode');
		this.selected_for = mode;
	},

	toggleActive: function(){
		var mode = this.selected_for;

		if (mode == 'compare'){
			this.model.toggle('selected_for_'+mode);
			this.model.toggle('active_selected');
		} else if (mode == 'detail'){
			app.instance.sectionMode.detail.call(app.instance, this.model.get('id'));
		}

		return this;

	},

	// updateSelected: function(){
	// 	var is_active = this.model.get('active_selected'),
	// 			mode = this.selected_for,
	// 			selected_for = 'selected_for_' + mode;

	// 	// If we're in compare mode
	// 	if (mode == 'compare') {
	// 		// Toggle the checkbox
	// 		is_active = !is_active;
	// 		// Persist its state
	// 		this.model.set(selected_for, is_active);
	// 		// Set to active
	// 		this.model.set('active_selected', is_active);
	// 		// console.log(this.model.get('active_selected'))
	// 	} else if (mode == 'detail' && !is_active) {
	// 		// Navigate to that page
	// 		app.instance.staged_article_detail = this.model.get('id');
	// 		app.instance.sectionMode.detail.call(app.instance);


	// 	}

	// 	return this;
	// },

	clearRadios: function(detailId){
		collections.article_summaries.instance.filter(function(model){
			var model_id = model.get('id');
			return model_id != detailId;
		}).forEach(function(model){
			model.set({
				active_selected: false,
				selected_for_detail: false
			});
		});

		return this
		// _.where(collections.po.article_summaries.items, {'selected_for_detail': true}).forEach(function(po_articleSummary){
		// 	var deselect_candidate_id = po_articleSummary.id,
		// 			bb_articleSummary;

		// 	if (id != deselect_candidate_id){
		// 		bb_articleSummary = collections.article_summaries.instance.findWhere({id: deselect_candidate_id})
		// 		if (bb_articleSummary) {
		// 			// Set state if in drawer
		// 			bb_articleSummary.set('selected_for_detail', false, {silent: true});
		// 			bb_articleSummary.set('active_selected', false);
		// 		} else {
		// 			po_articleSummary.selected_for_detail = false;
		// 			po_articleSummary.active_selected = false;
		// 		}
		// 	}
		// });

	},

	setDetailDrawerDisplay: function(model, selectedForDetail){
		// console.log('non-drawer')
		var id = model.get('id'),
				active_selected = model.get('active_selected');
		if (selectedForDetail){

			this.clearRadios(id);
			if (!active_selected) {
				this.model.set('active_selected', true);
			} 
		}
	},

	setActiveCssState: function(){
		var state = this.model.get('active_selected');
		// this.updateActiveSelectionField();
		// var active_selected = this.model.get('active_selected') || false, //Coerce `undefined` to `false`
		// 		selected_for_compare = this.model.get('selected_for_compare') || false, // Samesies
		// 		selected_for_detail = this.model.get('selected_for_detail') || false, // Et encore une fois
		// 		id = this.model.get('id'),
		// 		current_mode_selection_state = this.model.get('selected_for_'+this.selected_for) || false;


		// console.log('selected for compare',selected_for_compare)
		// console.log('active selected',active_selected)

		this.$el.find('.drawer-list-outer').toggleClass('active', state);
		this.$el.find('.inputs-container input').prop('checked', state);


		// TODO, maybe some replacement stuff now that we don't have pourover
		// Persist selected state onto pourover model
		// var po_model = _.findWhere(collections.po.article_summaries.items, {id: id});
		// po_model.selected_for_compare = selected_for_compare;
		// po_model.selected_for_detail = selected_for_detail;
		// po_model.active_selected = current_mode_selection_state;

		return this;
	},

	// TODO, maybe make these smaller to only show part of the name or not show the name at all
	addTags: function(){
		var subject_tags_full_unique = _.uniq(this.model.get('subject_tags_full'), function(tag){
					return tag.id;
				}),
				impact_tags_full_unique  = _.uniq(this.model.get('impact_tags_full'), function(tag){
					return tag.id;
				});

		if (subject_tags_full_unique.length) {
			this.$subjectTagsContainer.html('<span class="tag-list-title">Subj:</span>')
			subject_tags_full_unique.forEach(function(subjectTag){
				var tag_model  = new models.subject_tag.Model(subjectTag);
				var tag_view = new views.ArticleSummaryDrawerSubjectTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this._subviews.push(tag_view);

				this.$subjectTagsContainer.append(tag_markup);
			}, this);
		}


		// TODO, maybe make this view into a generic tag view or make a separate more specific impact view that shows level and category
		if (impact_tags_full_unique.length) {
			this.$impactTagsContainer.html('<span class="tag-list-title">Imp:</span>')
			impact_tags_full_unique.forEach(function(impactTag){
				var tag_model  = new models.subject_tag.Model(impactTag);
				var tag_view = new views.ArticleSummaryDrawerImpactTag({model:tag_model}),
						tag_markup = tag_view.render().el;

				this._subviews.push(tag_view);
				this.$impactTagsContainer.append(tag_markup);
			}, this);
		}


	},

	destroy: function(model){
		this.killView();
	}

});