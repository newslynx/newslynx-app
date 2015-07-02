views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	events: {
		'click input.destroy': 'destroyEvent',
		'submit form': 'saveModal',
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
		this.silenceView();

		// Clear if present
		// this.d3_el.select('.event-content').remove();
		this.render();
	},

	render: function(){
		this.silenceAllSubviews();

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
		this.bakeEventEditor();

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

		var event_editor_view = new views.EventEditor({el: this.$el, model: this.model.toJSON()});
		this._subviews.push(event_editor_view);

		this._time_picker = event_editor_view.time_picker;
		this.$el.append(event_editor_view.el);

		this.event_editor_view = event_editor_view;

		return this;

	},

	saveModal: function(e){
		e.preventDefault();

		var self = this;

		var current_view = this.event_editor_view,
		    form_data = current_view.getSettings();

		current_view.validateNew(current_view.full_info.schema, form_data, function(err, msg){
			if (!err){
				self.disableBtns();
				self.model.save(form_data, {
					error: function(model, response, options){
						console.log('Server error on event edit', response);
						var err = response.responseJSON;
						// TODO, test
						current_view.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model

						self.render();
						// Clear submit message
						current_view.printMsgOnSubmit(false, '');
						// Close the modal
						self.toggleModal(e);
					}
				});
			} else {
				current_view.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	},

	update: function(model, inSelection){
		if (!inSelection){
			this.killView();
		}

		return this;
	},

	destroyEvent: function(e){
		var self = this;
		// TODO animate this outro
		this.model.destroy({
    	success: function(model, response) {
				self.killView();
				self.toggleModal(e);
			},
			error: function(error){
				console.log('Error deleting event.', error);
			}
		});
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	disableBtns: function(){
		this.event_editor_view.$form.find('.buttons-container').addClass('disabled');
	}

});