views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	initialize: function(){

		this._subviews = [];
		// Don't need to do anything on initialize
		this.d3_el = d3.select(this.el);

		this.listenTo(this.model, 'change:in_selection', this.killView);
	},

	render: function(){
		var model_data = this.model.toJSON(),
				event_item;

		var _el = this.d3_el.selectAll('.event-content').data([model_data]).enter();

		var event_content = _el.append('div')
				.classed('event-content', true);

		// Timestamp
		event_content.append('div')
			.classed('event-timestamp', true)
			.html(function(d){ return helpers.templates.prettyTimestamp(d.timestamp); });

		// Title
		event_content.append('div')
			.classed('event-title', true)
			.html(function(d){ return d.title; });

		event_item = event_content.append('div')
			.classed('event-item', true);

		// What happened?
		event_item.append('div')
			.classed('event-item-title', true)
			.html('What happened?');

		event_item.append('div')
			.classed('event-item-text', true)
			.html(function(d){ return d.what_happened; });

		event_item = event_content.append('div')
			.classed('event-item', true);

		// Why is this important?
		event_item.append('div')
			.classed('event-item-title', true)
			.html('Why is this important?');

		event_item.append('div')
			.classed('event-item-text', true)
			.html(function(d){ return d.significance; });


		if (model_data.link){
			event_item = event_content.append('div')
				.classed('event-item', true);

			event_item.append('div')
				.classed('event-item-title', true)
				.html('Link');

			event_item.append('div')
				.classed('event-item-text', true)
				.html(function(d){ 
					return '<a href="'+d.link+'" target="_blank">' + d.link + '</a>'; 
				});
		}

		// Tags
		event_item = event_content.append('div')
			.classed('event-item', true);

		event_item.append('div')
			.classed('event-item-title', true)
			.html('Tags');

		// Why is this important?
		var tags_container = event_item.append('ul')
			.classed('event-tags-container', true)
			.classed('tag-list', true);

		tags_container.selectAll('.tag').data(function(d){ return d.impact_tags_full; }).enter()
			.append('li')
				.classed('tag', true)
				.classed('tooltipped', true)
					.each(function(d){
						var tag_model	= new models.subject_tag.Model(d);
						var tag_view	= new views.ArticleSummaryDrawerImpactTag({model:tag_model}),
								tag_markup = tag_view.render().$el.html(),
								tag_color = tag_view.getColor(),
								tag_label = tag_view.getLabel(),
								border_color = tag_view.getBorderColor();

						var d3_this = d3.select(this);
						d3_this.style('background-color', tag_color);
						// d3_this.style('border', '1px solid ' + border_color);
						d3_this.attr('aria-label', tag_label);
						d3_this.html(tag_markup);
					});

		// Save this so we may render 
		var edit_event_btn_cntnr = event_content.append('div')
			.classed('edit-event-container', true)
			.classed('modal-parent', true);

		edit_event_btn_cntnr.append('button')
			.classed('modal-toggle', true)
			.classed('edit-event', true)
			.classed('mini', true)
			.html('Edit')

		var edit_event_btn_modal_outer = edit_event_btn_cntnr.append('div')
			.classed('modal-outer', true);

		this.edit_event_btn_modal_outer = edit_event_btn_modal_outer;

		this.renderModal();

		return this;

	},

	renderModal: function(){

		var modal_outer = this.edit_event_btn_modal_outer;
		// We will pass the model's information
		var all_data = this.model.toJSON();

		var assignee = {
			id: all_data.id,
			title: all_data.title
		};

		var defaults = {
			timestamp: all_data.timestamp,
			text: all_data.text,
			link: all_data.link,
			title: all_data.title,
			what_happened: all_data.what_happened,
			significance: all_data.significance,
			impact_tags: all_data.impact_tags_full
		};

		// // Create an instance of an event creator view
		var event_creator_view = new views.EventEditor({defaults: defaults, el: modal_outer.node()});
		this._subviews.push(event_creator_view);
	},

	update: function(model, inSelection){
		if (!inSelection){
			this.killView();
		}

		return this;
	}

});