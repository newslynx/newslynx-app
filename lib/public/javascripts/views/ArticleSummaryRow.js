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
				article_detail_markup = templates.articleSummaryRowFactory( _.extend(model_json, helpers.templates) ),
				subject_tag_len,
				impact_tag_len;

		this.$el.html(article_detail_markup);
		this.$el.attr('data-title', model_json.title)
						.attr('data-timestamp', model_json.timestamp);

		// TODO, This data transformation might be cleanera as a method on the article summary model
		// Since that's how we're doing it now forextrating timeseries data
		this.data = this.transformData(this.model.toJSON());

		// Add a whole bunch of quant attributes dynamically
		_.each(this.data.quant_metrics, function(bullet){
			$el.attr('data-'+bullet.metric, bullet.value);
		});

		// Add aggregate values for bars
		if (this.data.subject_tags) { 
			subject_tag_len = this.data.subject_tags.length;
		} else {
			subject_tag_len = 0;
		}

		$el.attr('data-subject-tags', subject_tag_len);

		if (this.data.impact_tags) { 
			impact_tag_len = this.data.impact_tags.length;
		} else {
			impact_tag_len = 0;
		}

		$el.attr('data-impact-tags', impact_tag_len);

		this._el = d3.select( this.el ).select('.article-detail-row-container').selectAll('.cell');

		this.update();
		return this;
	},

	transformData: function(modelData){
		// For subject tags, chunk them into groups of four so they will be displayed as columns of no more than four. Each one looks like this and they're stored under `subject_tags_full`.
		/*
    {
      "articles": 2,
      "domain": "propalpatine.org",
      "name": "Fracking",
      "color": "#6a3d9a",
      "id": 5,
      "events": 2
    }
		*/
		// `tag_columns` will be a list of lists, each containing no more than four tags
		var tag_columns = [],
				chunk = 4;

		if (modelData.subject_tags_full){
			for (var i = 0; i < modelData.subject_tags_full.length; i += chunk) {
				tag_columns.push( modelData.subject_tags_full.slice(i,i+chunk) );
			}
			modelData.subject_tags_grouped = tag_columns;

		}

		if (modelData.impact_tags_full){

			// Impact tags need more nesting. It makes most sense to group them by category
			// These tags look like this and they're found under `impact_tags_full`.
			/*
			{
	      "category": "change",
	      "articles": 2,
	      "domain": "propalpatine.org",
	      "name": "legislative impact",
	      "level": "Institution",
	      "color": "#fb8072",
	      "events": 2, 
	      "id": 1
	    }
			*/
			modelData.impact_tags_grouped = d3.nest()
				.key(function(d) { return d.category; })
	 			.entries(modelData.impact_tags_full);
		}

		// // Next by tag category
		// modelData.qual_metrics['impact_tags'] = d3.nest()
		// 	.key(function(d) { return d.category } )
		// 	.rollup(function(list){
		// 		return {
		// 			count: list.length,
		// 			values: list
		// 		}
		// 	})
		// 	.entries(modelData.qual_metrics['impact_tags'])

		// TEMPORARY, remove total_time_on_page, internal and external
		var column_order = ['twitter', 'facebook', 'pageviews', 'avg_time_on_page'];
		modelData.quant_metrics = modelData.quant_metrics.filter(function(qMetric){
			return column_order.indexOf(qMetric.metric) != -1;
		});
		
		// Sort the quant data so it plots the right values for how we set up the grid
		modelData.quant_metrics.sort(function(a,b){
			return column_order.indexOf(a.metric) - column_order.indexOf(b.metric)
		});

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
				.classed('tooltipped', true)
				.attr('data-tooltip-align', 'left')
				.attr('data-id', function(d) { return d.id })
				.attr('aria-label', function(d) { return d.title })
				.append('div')
					.classed('title-text', true)
					.html(function(d) { return d.title });
					// .html(function(d) { return d.id });

		// And date
		row.append('div')
				.classed('cell', true)
				.classed('date', true)
				.classed('single', true)
				.attr('data-timestamp', function(d) { return d.timestamp } )
				.html(function(d) { return helpers.templates.conciseDate(d.timestamp) });

		// Make a container for the bullet
		var bullet_container = this._el.data(this.data.quant_metrics).enter()
			.append('div')
				.classed('cell', true)
				.classed('multi', true)
				.classed('gfx', true)
				.classed('tooltipped', true)
				.attr('aria-label', function(d){
					var metric = d.metric,
							units = '',
							value = d.value;

					if (metric == 'avg_time_on_page') { 
						units = ' (s)' 
						if (value > 0) value = value.toFixed(2)
					};

					return helpers.templates.prettyPrintSource(d.metric) + units + ': ' + helpers.templates.addCommas(value);
				})
				.on('mouseenter', function(d){ 
					console.log(d) 
				})
				.append('div')
					.classed('bullet-container', true);

		// Do the bullet
		var that = this;
		bullet_container.append('div')
					.classed('bullet', true)
					.style('width', function(d) { 
						return that.helpers.calcSize(d.metric, d.value) 
					});

		// // And the marker
		// bullet_container.append('div')
		// 			.classed('marker', true)
		// 			.style('left', function(d) { 
		// 				return that.helpers.calcSize(d, 'per75');
		// 			});

		// Make a container for subject bar tags
		var subject_bar_container = row.append('div')
			.classed('cell', true)
			.classed('bars', true)
			.classed('gfx', true)
			.append('div')
				.classed('bar-container', true)
				.attr('data-group', 'subject-tags');

		// Only do this if articles have subject tags
		if (this.data.subject_tags_grouped) {
			subject_bar_container.selectAll('.bar-column').data(this.data.subject_tags_grouped).enter()
				.append('div')
				.classed('bar-column', true)
				.selectAll('.bar').data(function(d) { return d; }).enter()
					.append('div')
						.classed('bar', true)
						.style('background-color', function(d) { return d.color; })
						.on('mouseenter', function(d){ console.log(d); }); // TOOD, mouseover tooltip
		}


		// Make a container for impact bar tags 
		var impact_bar_container = row.append('div')
			.classed('cell', true)
			.classed('bars', true)
			.classed('gfx', true)
			.append('div')
				.classed('bar-container', true)
				.attr('data-group', 'impact-tags');

		if (this.data.impact_tags_grouped) {
			var impact_bar_column = impact_bar_container.selectAll('.bar-column').data(this.data.impact_tags_grouped).enter()
				.append('div')
					.classed('bar-column', true)

			impact_bar_column.selectAll('.bar').data(function(d) { return d.values }).enter()
				.append('div')
					.classed('bar', true)
					.style('background-color', function(d) { return d.color })
					.on('mouseenter', function(d){ console.log(d) });
		}

	},
	updateBulletMarker: function(){


		return this;
	},

	goToDetail: function(e){
		var article_id = $(e.currentTarget).attr('data-id');
		app.instance.staged_article_detail = +article_id;
		models.section_mode.set('mode', 'detail');
		return this;
	},

	close: function(){
		collections.article_comparisons.instance.remove(this.model);
		app.instance.saveHash();
		return this;
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
		return this;
	},

	helpers: {
		calcSize: function(metric, val){
			var max_field = ['per95','per97_5','max'];
			var max = _.findWhere(pageData.orgInfo.metric_maxes, {metric: metric})[max_field[1]];
			var scale = d3.scale.linear()
										.domain([0, max])
										.range([0, 100]);

			return scale(val).toString() + '%';
		}
	}

});
