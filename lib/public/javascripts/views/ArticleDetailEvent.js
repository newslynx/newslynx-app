views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	initialize: function(){
		// Don't need to do anything on initialize
		this.d3_el = d3.select(this.el);

		this.listenTo(this.model, 'change:in_selection', this.remove);
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
					.each(function(d){
						var tag_model	= new models.subject_tag.Model(d);
						var tag_view	= new views.ArticleSummaryDrawerImpactTag({model:tag_model}),
								tag_markup = tag_view.render().$el.html(),
								tag_color = tag_view.getColor();

						d3.select(this).html(tag_markup);
						d3.select(this).style('background-color', tag_color)
					})
		return this;

	},

	update: function(model, inSelection){
		if (!inSelection){
			this.el.remove()
		}

		return this;
	}

});