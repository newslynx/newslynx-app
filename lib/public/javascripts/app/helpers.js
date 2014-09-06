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

	isotope: {
		initCntnr: function(){
			this.$isotopeCntnr = this.$listContainer;
			this.$isotopeCntnr.isotope({
				itemSelector: this.isotopeChild, 
				 masonry: {
		      columnWidth: 400
		    },	
				getSortData: {
					timestamp: '[data-timestamp] parseFloat',
					title: '[data-title]',
					date: '[data-date]',
					twitter: '[data-twitter] parseFloat',
					facebook: '[data-facebook] parseFloat',
					pageviews: '[data-pageviews] parseFloat',
					'time-on-page': '[data-time-on-page] parseFloat',
					internal: '[data-internal] parseFloat',
					external: '[data-external] parseFloat',
					subject: '[data-subject-tags] parseFloat',
					impact: '[data-impact-tags] parseFloat'
				}
			});
		},
		clearCntnr: function(){
			if (this.$isotopeCntnr) this.$isotopeCntnr = null;
		},
		addItem: function($el){
			this.$isotopeCntnr.isotope('appended', $el);
		},
		relayout: function(sortBy, sortAscending){
			sortBy = sortBy || 'timestamp';
			if (_.isUndefined(sortAscending)) {
				sortAscending = false;
			}
			app.instance.$isotopeCntnr.isotope({sortBy: sortBy, sortAscending: sortAscending});
			app.instance.$isotopeCntnr.isotope('layout');
		}
	}
}