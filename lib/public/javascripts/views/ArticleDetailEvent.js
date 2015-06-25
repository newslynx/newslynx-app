views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	events: {
		'click input.destroy': 'destroyEvent'
	},

	initialize: function(){

		this._subviews = [];
		// var that = this;
		// Don't need to do anything on initialize
		// this.d3_el = d3.select(this.el);

		this.listenTo(this.model, 'change:in_selection', this.killView);
		this.listenTo(this.model, 'refresh', this.refresh); // TODO, change where this is triggered
	},

	refresh: function(){
		// this.killView();

		// Clear if present
		// this.d3_el.select('.event-content').remove();
		this.render();
	},

	render: function(){
		var model_json = this.model.toJSON();
		var event_item_markup = templates.articleDetailEventFactory( _.extend(model_json, helpers.templates.articles) );
		this.$el.html(event_item_markup);

		this.$eventTagsContainer = this.$el.find('.event-tags-container');

		this.postRender();

		// this.edit_event_btn_modal_outer = edit_event_btn_modal_outer;

		// this.renderModal();

		return this;

	},

	postRender: function(){

		this.bakeTags();
		// this.bakeEventEditor();

		return this;
	},

	bakeTags: function(){

		var impact_tags = this.model.get('impact_tags_full');
		impact_tags.forEach(function(impactTag){
			var tag_view = new views.ArticleSummaryDrawerImpactTag({model: impactTag})
			var tag_markup = tag_view.render().el;
			this._subviews.push(tag_view);
			this.$eventTagsContainer.append(tag_markup);
		}, this);

		return this;
	},

	bakeEventEditor: function(){

		var event_creator_view = new views.EventCreatorFromAlert({el: this.el, model: this.model.toJSON()});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view.time_picker;
		this.$el.append(event_creator_view.el);

		this.event_creator_view = event_creator_view;

		return this;

	},

	// renderModal: function(){

	// 	var modal_outer = this.edit_event_btn_modal_outer;
	// 	// We will pass the model's information
	// 	var all_data = this.model.toJSON();

	// 	var assignee = {
	// 		id: all_data.id,
	// 		title: all_data.title
	// 	};

	// 	var defaults = {
	// 		timestamp: all_data.timestamp,
	// 		link: all_data.link,
	// 		title: all_data.title,
	// 		description: all_data.description,
	// 		impact_tags: all_data.impact_tags_full
	// 	};

	// 	// // Create an instance of an event creator view
	// 	var event_creator_view = new views.EventEditor({defaults: defaults, el: modal_outer.node(), model: this.model});
	// 	this._subviews.push(event_creator_view);
	// },

	update: function(model, inSelection){
		if (!inSelection){
			this.killView();
		}

		return this;
	},

	destroyEvent: function(){
		var that = this;
		this.model.destroy({
    	success: function(model, response) {
				that.killView();

			},
			error: function(error){
				console.log('Error deleting event.', error);
			}
		});
	}

});