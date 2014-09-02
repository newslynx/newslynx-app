views.ArticleSummaryRow = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-row-wrapper',

	events: {
		'click .title': 'goToDetail',
		'click .destroy': 'close'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);
	},

	render: function() {
		var $el = this.$el,
				model_json = this.model.toJSON(),
				article_detail_markup = templates.articleSummaryRowFactory( _.extend(model_json, helpers.templates) );

		this.$el.html(article_detail_markup);
		this.$el.attr('data-title', model_json.title)
						.attr('data-date', model_json.timestamp);

		// this.data = this.transformData(this.model.toJSON());
		this.data = this.model.toJSON();

		// Add a whole bunch of quant attributes dynamically
		_.each(this.data.quant_metrics, function(bullet){
			$el.attr('data-'+bullet.metric, bullet.count);
		})
		// // Add aggregate values for bars
		// $el.attr('data-qual-subject-tags', this.data.qual_metrics['subject_tags'].length);

		// _.each(this.data.qual_metrics['impact_tags'], function(category){
		// 	$el.attr('data-qual-'+category.key, category.values.count);
		// });
		// console.log(this.data)

		this._el = d3.select( this.el ).select('.article-detail-row-container').selectAll('.cell');

		this.update();
		return this;
	},

	transformData: function(modelData){
		var tag_columns = false;
		modelData.qual_metrics = d3.nest()
			.key(function(d) { return d.metric } )
			.rollup(function(list){
				// Turn each tag id into a tag object
				var tags = $.extend(true, [], list.map(function(d) {return pageData.orgInfo[d.metric].filter(function(f){ return f.id == d.id })[0] }) );
				// Split subject tags into groups of 4 each so they can be put into different columns
				if (list[0].metric == 'subject_tags'){
					var i,j,chunk = 4;
					tag_columns = [];
					for (i = 0, j = tags.length; i < j; i += chunk) {
						tag_columns.push( tags.slice(i,i+chunk) );
					}
					tags = tag_columns;
				}
				return tags;
			})
			.map(modelData.qual_metrics);

		// Next by tag category
		modelData.qual_metrics['impact_tags'] = d3.nest()
			.key(function(d) { return d.category } )
			.rollup(function(list){
				return {
					count: list.length,
					values: list
				}
			})
			.entries(modelData.qual_metrics['impact_tags'])

		return modelData;
	},

	update: function(cb){
		var row = this._el.data([this.data]).enter(); // This should work with `datum` and not have to wrap in an array, but that is giving an undefined enter selection.
		
		// Add the first two cells
		// Title
		row.append('div')
				.classed('cell', true)
				.classed('title', true)
				.classed('wide', true)
				.attr('data-article_id', function(d) { return d.article_id })
				.html(function(d) { return d.title });

		// And date
		row.append('div')
				.classed('cell', true)
				.classed('date', true)
				.classed('single', true)
				.attr('data-date', function(d) { return d.timestamp } )
				.html(function(d) { return helpers.templates.conciseDate(d.timestamp) });

		// Make a container for the bullet
		var bullet_container = this._el.data(this.data.quant_metrics).enter()
			.append('div')
				.classed('cell', true)
				.classed('multi', true)
				.classed('gfx', true)
				.append('div')
					.classed('bullet-container', true);

		// Do the bullet
		var that = this;
		bullet_container.append('div')
					.classed('bullet', true)
					.style('width', function(d) { return that.helpers.calcSize(d, 'count') } );

		// // And the marker
		// bullet_container.append('div')
		// 			.classed('marker', true)
		// 			.style('left', function(d) { return that.helpers.calcSize(d, 'median') } );

		// Make a container for subject bar tags
		// var subject_bar_container = row.append('div')
		// 	.classed('cell', true)
		// 	.classed('bars', true)
		// 	.classed('gfx', true)
		// 	.append('div')
		// 		.classed('bar-container', true)
		// 		.attr('data-group', 'subject-tags');

		// subject_bar_container.selectAll('.bar-column').data(this.data.qual_metrics['subject_tags']).enter()
		// 	.append('div')
		// 	.classed('bar-column', true)
		// 	.selectAll('.bar').data(function(d) { return d }).enter()
		// 		.append('div')
		// 			.classed('bar', true)
		// 			.style('background-color', function(d) { return d.color });

		// // Make a container for impact bar tags 
		// var impact_bar_container = row.append('div')
		// 	.classed('cell', true)
		// 	.classed('bars', true)
		// 	.classed('gfx', true)
		// 	.append('div')
		// 		.classed('bar-container', true)
		// 		.attr('data-group', 'impact-tags');

		// var impact_bar_column = impact_bar_container.selectAll('.bar-column').data(this.data.qual_metrics['impact_tags']).enter()
		// 	.append('div')
		// 		.classed('bar-column', true)

		// impact_bar_column.selectAll('.bar').data(function(d) { return d.values.values }).enter()
		// 	.append('div')
		// 		.classed('bar', true)
		// 		.style('background-color', function(d) { return d.color });

		// Initialize isotope on this item
		// cb.call(app.instance, this.$el);
	},
	updateBulletMarker: function(){



	},

	goToDetail: function(e){
		var article_id = $(e.currentTarget).attr('data-article_id');
		app.instance.divisionSwitcher.updateHash('single', article_id);
	},

	close: function(){
		collections.article_comparisons.instance.remove(this.model);
		app.instance.saveHash();
	},

	destroy: function(model, destroyMode){
		if (destroyMode == 'delete') {
			if (app.instance.$isotopeCntnr) { 
				app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout'); 
			} else { 
				this.remove(); 
			}
			// Reset the destroy mode so we might add it and destroy it again
			model.set({'destroy': false}, {silent: true});
		}
	},

	helpers: {
		calcSize: function(d, value){
			var val = d[value];
			var max = pageData.orgInfo.metric_maxes.filter(function(f) { return f.metric = d.metric })[0].max;
			var scale = d3.scale.linear()
										.domain([0, max])
										.range([1, 100]);

			return scale(val).toString() + '%';
		}
	}

});
