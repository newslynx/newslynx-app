app.helpers = {

	drawer: {
		determineBehavior: function(){
			var behavior = 'radio';
			if (models.section_mode.get('mode') == 'compare') {
				behavior = 'checkbox';
			}
			return behavior;
		},
		getAllIds: function(){
			var ids = [];
			// Add all the ids in our loaded articles and set the hash to that
			_.each(this.drawerData, function(drawerDatum) { ids.push(drawerDatum[this.listId]) }, this);
			// Because we're finding the drawer item ids based on the detail items, we might have duplicates, such as in the approval river
			return ids;
		}
	},

	gifizeLoadMoreButton: function($loadMore){
		$loadMore.html('Loading... ').addClass('disabled').addClass('loading-spinner');
	},

	isotope: {
		initCntnr: function(dimensions){
			this.$isotopeCntnr = this.$listContainer;
			this.$isotopeCntnr.isotope({
				itemSelector: this.isotopeChild, 
				 masonry: {
		      columnWidth: 400
		    },	
				getSortData: dimensions
			});
		},
		clearCntnr: function(){
			if (this.$isotopeCntnr) this.$isotopeCntnr = null;
		},
		addItem: function($el){
			this.$isotopeCntnr.isotope('appended', $el);
			app.instance.setLoading(app.instance.$content, false);
		},
		relayout: function(sortBy, sortAscending){
			sortBy = sortBy || 'timestamp';
			if (_.isUndefined(sortAscending)) {
				sortAscending = false;
			}
			app.instance.$isotopeCntnr.isotope({sortBy: sortBy, sortAscending: sortAscending});
			app.instance.$isotopeCntnr.isotope('layout');

		}
	},

	exportData: {

		addExportedDate: function(nowMoment){
			return function(objToAugment){
				var augmented_obj = {}
				augmented_obj.exported_date = nowMoment.format()
				_.extend(augmented_obj, objToAugment);
				return augmented_obj;
			}
		},

		flattenComparisons: function(comparisonObj, articleJsons) {
		// flattenComparisons: function(comparisonObj, modelMetrics, modelId) {
			// console.log(comparisonObj)
			// Always deal with this as a list

			var comparison_csv = []

			_.each(comparisonObj, function(subGroup, groupName){
				// The `all` comparison object is an array, the others are dictionaries of sub groups
				// var metric_row_shell = {
				// 	content_item_id: modelId
				// }
				var metric_group;
				articleJsons.forEach(function(articleJson){
					var article_id = articleJson.id
					var metric_row_shell = {
						content_item_id: article_id
					}
					if (_.isArray(subGroup)){
						// _.extend(, metric_row_shell);
						metric_group = subGroup.map(function(metricRow){
							var row = {};

							_.extend(row, {
								group: groupName,
								subGroup: 'all'
							}, metric_row_shell, {article_value: articleJson.metrics[metricRow.metric]}, metricRow)
							return row
						})
						comparison_csv = comparison_csv.concat(metric_group);
					} else {
						_.each(subGroup, function(metricsList, subGroupName){
							// console.log(groupName, subGroupName, metricsList)
							metric_group = metricsList.map(function(metricRow){
								var row = {}
								_.extend({
									group: groupName,
									subGroup: subGroupName
								}, {article_value: articleJson.metrics[metricRow.metric]}, metric_row_shell, metricRow)
								return row
							})
							comparison_csv = comparison_csv.concat(metric_group);
						});

					}
				})
			});

			return comparison_csv;
		},

		concatTags: function(articlesJson, which) {
			var tag_csv = []
			articlesJson.forEach(function(articleJson){
				articleJson[which + '_tags_full'].forEach(function(tag){
					var row = {
						content_item_id: articleJson.id
					}
					_.extend(row, tag)
					tag_csv.push(row)
				})
			})
			return tag_csv
		}

	}
	
}