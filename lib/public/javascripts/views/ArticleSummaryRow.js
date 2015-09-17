views.ArticleSummaryRow = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-row-wrapper',

	events: {
		'click .destroy': 'removeRow'
	},

	initialize: function(){
		this.listenTo(this.model, 'removeFromComparison', this.destroy);
		this.listenTo(this.model, 'redrawMarker', this.redrawMarker);

		// Store how we're calculating the marker 
		this.calcComparisonMarkerParams();
	},

	render: function() {
		var $el = this.$el,
				model_json = this.model.toJSON(),
				data_for_template = _.extend(
					{
						selects: this.collection.getSelectDimensions(),
						calcSize: this.calcSize,
						comparisonOperation: this.comparison_marker_operation,
						comparisonMax: this.comparison_marker_max,
						comparisonGroup: this.comparison_marker_group
					}, 
					model_json, 
					helpers.templates.articles);

		var article_detail_markup = templates.articleSummaryRowFactory( data_for_template ),
				subject_tags_str = '',
				impact_tags_count = 0; // For now these are separate, which seems to make the most sense. You sort subject matter categorically and impact by number


		this.$el.html(article_detail_markup);

		// Add our selects for 
		this.$el.attr('data-title', model_json.title)
						.attr('data-created', model_json.created);

		// Add a whole bunch of quant attributes dynamically
		_.each(model_json.metrics, function(val, key){
			$el.attr('data-'+key, val);
		});

		// Add all names for our tags, these should already be in alphabetical order from the hydration process
		if (model_json.subject_tags_full) { 
			subject_tags_str = _.pluck(model_json.subject_tags_full, 'name').join('');
		} 
		$el.attr('data-subject_tags', subject_tags_str);


		// Do the same for impact tags
		if (model_json.impact_tags_full) { 
			impact_tags_count = model_json.impact_tags_full.length
		} 

		$el.attr('data-impact_tags', impact_tags_count);

		this.model_json = model_json;
		this.bullet_markers = d3.select(this.el).selectAll('.marker');

		return this;
	},

	calcComparisonMarkerParams: function(){
		this.comparison_marker_operation 	= collections.article_comparisons.instance.metadata('operation'); // mean
		this.comparison_marker_group 			= collections.article_comparisons.instance.metadata('group'); // all
		this.comparison_marker_max 				= collections.article_comparisons.instance.metadata('max'); // per_97_5
		return this;
	},

	redrawMarker: function(){
		this.calcComparisonMarkerParams();

		var self = this;
		var markers = this.bullet_markers
			.style('left', function(){
				var d3_el = d3.select(this),
						metric_name = d3_el.attr('data-metric-name');
				return self.calcSize.call(self, metric_name, self.comparison_marker_operation, self.comparison_marker_max, self.comparison_marker_group);
			});

	},

	removeRow: function(){
		collections.article_comparisons.instance.remove(this.model);
		app.instance.saveHash();
		return this;
	},

	destroy: function(model, destroyMode){
		if (app.instance.$isotopeCntnr) { 
			app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); 
		}
		this.killView();

		return this;
	},

	calcSize: function(metric, val, max, group){
		/** Metric options: per97_5, per75, median, per25, per2_5, per5, per95, mean **/
		group = group || this.comparison_marker_group;
		max = max || this.comparison_marker_max;

		// For every category but all, this is nested under another key. so if it's a subject tag, it will be under `subject_tags.<id>`
		// TODO, this needs to be built out more to allow for other comparisons besides subject tags
		var comparison_object_list;
		if (group == 'all'){
			comparison_object_list = models.comparison_metrics.get(group);
		} else {
			comparison_object_list = models.comparison_metrics.get('subject_tags')[group];
		}

		var this_metrics_info = $.extend(true, {}, _.findWhere(comparison_object_list, {metric: metric})),
				max,
				scale,
				val_percent;

		if (this_metrics_info){
			max = this_metrics_info[max];

			scale = d3.scale.linear()
									.domain([0, max])
									.range([0, 97]);

			var numb_val
			if (typeof val == 'string') {
				// console.log(val)
				numb_val = this_metrics_info[val];
				if (!val){
					console.log('ERROR: Missing max comparison value for group', group, 'and metric', metric, 'in field', val);
					val = 0;
				}
			}
			// console.log(metric, numb_val, val, max, group, this_metrics_info)

			var to_scale_val = numb_val || val

			val_percent = Math.round(scale(to_scale_val)).toString() + '%';
			
		}else{
			console.log('ERROR: Missing comparison values for group', group, 'and metric', metric, 'for group', group, 'in comparison object list', comparison_object_list);
			val_percent = '0%';
		}
		return val_percent;
	}

});
