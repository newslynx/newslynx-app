views.ArticleDetailEvent = Backbone.View.extend({

	className: 'event-container',

	initialize: function(){
		// Don't need to do anything on initialize
		var model_data = this.model.toJSON();
		this.d3_el = d3.select(this.el)
		// this._container = this.d3_el.selectAll('.event-container').data(model_data).enter();

		// console.log(this._container)
	},

	render: function(){
		var model_data = this.model.toJSON();

		var _el = this.d3_el.selectAll('.event-content').data([model_data]).enter();

		var event_content = _el.append('div')
				.classed('event-content', true);

		event_content.append('div')
			.classed('event-timestamp', true)
			.html(function(d){ return helpers.templates.prettyTimestamp(d.timestamp/1000); });

		event_content.append('div')
			.classed('event-title', true)
			.html(function(d){ return d.title; });

		return this;

	},

	update: function(){

		return this;
	}

});