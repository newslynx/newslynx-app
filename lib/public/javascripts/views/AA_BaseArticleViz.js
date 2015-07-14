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

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // `mean` or `median`
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // `all` for now
		// this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('comparison-marker-max');

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

	render: function(renderMarker){
		var self = this;
		var vizContainer = this.$vizContainer.get(0);
		var d3_vizContainer = d3.select(vizContainer);

		var _columns = d3_vizContainer.selectAll('.bar-container').data(this.data).enter();

		var bar_container = _columns.append('div')
			.classed('bar-container', true);


		// Do the bullet
		bar_container.append('div')
				.classed('bar', true)
				.style('width', function(d){
					return ((d.pageviews / self.total)*100).toFixed(2) + '%';
				});

		// And the marker
		// But only if that's set
		// It's currently not being drawn for domain referrers bc we don't have that data
		// TODO, maybe cache this value so we're not calculating it multiple times
		var bullet_markers;
		if (renderMarker){
			bullet_markers = bar_container.append('div')
				.classed('marker-container', true)
				.style('left', function(d) { 
					return self.calcLeftOffset(d.facet, self.comparison_marker_operation);
				})
				.classed('tooltipped', true)
				.attr('aria-label', function(d){
					var dimension = helpers.templates.toTitleCase(self.comparison_marker_operation);

					if (dimension == 'Mean'){
						dimension = 'Average'
					}
					return dimension + ' of ' + self.comparison_marker_group + ' articles: ' + self.calcLeftOffset(d.facet, self.comparison_marker_operation);
				})
				.attr('data-tooltip-align', function(d){
					var leftOffset = parseInt(self.calcLeftOffset(d.facet, self.comparison_marker_operation)),
							alignment = 'center';

					if (leftOffset <= 20){
						alignment = 'left'
					} else if (leftOffset > 75) {
						alignment = 'right'
					}

					return alignment;
				})
				.append('div')
					.classed('marker', true);
		}

		bar_container.append('div')
					.classed('label', true)
					.html(function(d){
						var percent = self.fancyPercent(d.pageviews/self.total),
								count = (d.pageviews) ? (helpers.templates.addCommas(d.pageviews)) : ''; // Only print this string if count isn't zero

						return '<strong>' + helpers.templates.toTitleCase(d.facet_display_name) + '</strong> &mdash; ' + percent+ ', ' + count;
					});

		this.bar_container = bar_container;

		return this;

	},

	redrawMarker: function(){
		this.calcComparisonMarkerParams();

		var self = this;
		var markers = this.bar_container.selectAll('.marker-container') 
			.style('left', function(){
				var d3_el = d3.select(this),
						metric_name = d3_el.attr('data-metric-name');
				return self.calcLeftOffset.call(self, metric_name, self.comparison_marker_operation, self.comparison_marker_max, self.comparison_marker_group);
			});

		// var that = this;
		// // Don't save a cached selector because then sometimes we'll have that var and sometimes we won't
		// // A better is to make a selection on redraw, which will either be empty or have something
		// var markers = this.bar_container.selectAll('.marker-container') 
		// 		.transition()
		// 		.duration(450)
		// 		.ease('exp-out')
		// 		.styleTween('left', function(d) { 
		// 			// This is madness, but d3 requires us to venture to such depths
		// 			// D3 won't interpolate a starting value in the way you think
		// 			// So if you want to interpolate from left 23% to left 26%
		// 			// It will interpolate from the pixel representation of 23% to 20%
		// 			// So that will go from 10px to 20%, the 10px acts like a percent
		// 			// So we reverse engineer the percent from the pixel value wrt to its parent container
		// 			// And set that as the starting percentage
		// 			// Some reference https://github.com/mbostock/d3/issues/1070
		// 			var starting_px = parseFloat(d3.select(this).style('left')),
		// 					parent_px = this.parentNode.offsetWidth,
		// 					starting_percent = starting_px/parent_px * 100,
		// 					ending_percent = that.calcLeftOffset(d.facet, that.comparison_marker_operation),
		// 					ending_pixel = parseFloat(ending_percent)* parent_px;

		// 			return d3.interpolate(starting_percent, ending_percent); 
		// 		})
		// 		.attr('aria-label', function(d){
		// 			return helpers.templates.toTitleCase(that.comparison_marker_operation) + ' of ' + that.comparison_marker_group + ' articles: ' + that.calcLeftOffset(d.facet, that.comparison_marker_operation);
		// 		})

	},

	calcLeftOffset: function(metric, val, group){
	/** Metric options: per97_5, per75, median, per25, per2_5, per5, per95, mean **/
		group = group || this.comparison_marker_group;
		var max = this.comparison_marker_max;

		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object;
		if (group == 'all'){
			comparison_object = models.comparison_metrics.get(group);
		} else {
			comparison_object = models.comparison_metrics.get('subject_tags')[group];
		}


		var this_metrics_info = _.findWhere(comparison_object, {metric: metric}),
				max,
				scale,
				val_percent;

		if (this_metrics_info){
			max = this_metrics_info[max];

			scale = d3.scale.linear()
									.domain([0, max])
									.range([0, 100]);

			if (typeof val == 'string') {
				val = this_metrics_info[val];
				if (!val){
					console.log('ERROR: Missing max comparison value for group:', group, 'And metric:', metric, 'In field:', val);
					val = 0;
				}
			}

			val_percent = Math.round(scale(val)).toString() + '%';
			
		}else{
			console.log('ERROR: Missing comparison values for group', group, 'and metric', metric);
			val_percent = '0%';
		}
		return val_percent;		
	}


});