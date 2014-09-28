views.AA_BaseArticleViz = Backbone.View.extend({

	tagName: 'section',

	className: 'article-detail-viz-container',

	setMarkup: function(){
		this.setTitle();
		this.setContainer();
	},

	setTitle: function(){
		this.$el.html('<h3 class="title">'+this.section_title+'</h3>');
		return this;
	},

	setContainer: function(){
		this.$vizContainer = $('<div class="viz-container"></div>').appendTo(this.$el);
		return this;
	},

	fancyPercent: function(decimal){
		if (decimal < .01) { 
			return '<1%'; 
		} else {
			return Math.round(decimal*100) + '%';
		}

	},

	render: function(){
		var that = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		_columns.append('div')
			.classed('bar-container', true)
			.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.pageviews / that.total)*100).toFixed(2) + '%';
				})
				.append('div')
					.classed('label', true)
					.html(function(d){
						var percent = that.fancyPercent(d.pageviews/that.total),
								count = (d.pageviews) ? (helpers.templates.addCommas(d.pageviews)) : ''; // Only print this string if count isn't zero

						return '<strong>' + helpers.templates.toTitleCase(d.facet) + '</strong> &mdash; ' + percent+ ', ' + count;
					});


		return this;

	}

});