app.helpers = {

	drawer: {
		setModeOnly: function(mode){
			models.section_mode.set('mode', mode);
		},
		add: function(mode, ids){
			app.helpers.drawer.setModeOnly(mode);
			// if (ids) collections.drawer_items.instance.setBoolByIds('viewing', this.listId, ids, false); // This is an intermediate hack to make it so that it triggers the detail view on division switch, since the add to collection function only listens to a change in viewing
			if (ids) {
				collections.drawer_items.instance.setBoolByIds('viewing', this.listId, ids, true);
			}
		},
		remove: function(mode, ids){
			app.helpers.drawer.setModeOnly(mode);
			if (ids) {
				collections.drawer_items.instance.setBoolByIds('viewing', this.listId, ids, false);
			}
		},
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
		},
		enableAll: function(){
			app.instance.model.set('view-all', true);
			models.drawer_item_all.instance.set('viewing', true);
		}
	},

	itemDetail: {
		go: function(listItemModel){
			var is_new = listItemModel.get('viewing'),
					id = listItemModel.get(this.listId),
					pending = 9,
					min_timestamp = collections.all_detail_items.instance.meta('timestamp'),
					destination,
					action;

			// If it is a `viewing` article, fetch its data
			if (is_new) {
				destination = app.helpers.itemDetail.add;
				action = 'add';
			} else {
				destination = app.helpers.itemDetail.remove;
				action = 'remove';
			}
			// app.helpers.itemDetail.fetch.call(this, id, action, destination);
			app.helpers.itemDetail.fetch.call(this, id, action, destination, pending, min_timestamp);
			return this;
		},
		fetch: function(itemId, action, cb, pending, minTimestamp){
			// If this id already has a detailed Json object loaded, then return that
			// If not, then fetch it from the server
			var mode = models.section_mode.get('mode');
			// var loaded_matches = collections.all_detail_items.instance.where({recipe_id: itemId}); 
			var loaded_matches = collections.all_detail_items.instance.filterAlerts(app.instance.detailId, itemId);
			// var loaded_matches = _.filter(this[mode].detailData, function(obj) { return obj[app.instance.detailId] === itemId });
			if ((loaded_matches.length && mode != 'my-recipes') || (mode == 'my-recipes' && loaded_matches.length == pending)) {

				cb.call(this, loaded_matches);
				// Reload layout
				app.instance.$isotopeCntnr.isotope({sortBy: 'timestamp', sortAscending: false});
			} else {
				// If we have no matches of detailed items but we're in removal mode, that's fine, we don't need to fetch anything
				// This occurs in approval river when you're deselecting an alert that has no pending items
				// There's no need to go and fetch things because there's nothing to fetch
				if (action != 'remove'){
					var new_article_detail = new this[mode].Model({id: itemId}),
							options = {};
					if (minTimestamp) {
							options = { 
								data: { after: minTimestamp},
								processData: true
							}
					}
					new_article_detail.fetch(options, {
						success: function(model, response, options){
							console.log('success')
							// Response should be the array of matching json objects to add
							cb(response);
						},
						error: function(model, response, options){
							console.log('Error fetching ' + itemId);
							cb([]);
						}
		   		});
				}
			}
		},
		add: function(itemData){
			collections.detail_items.instance.set(itemData);
			app.instance.$isotopeCntnr.isotope('layout');
		},
		remove: function(itemData){
			var that = this;
			itemData.forEach(function(itemDatum){
				var detailId = itemDatum[that.detailId],
						where_obj = {};
				where_obj[that.detailId] = detailId;
				collections.detail_items.instance.remove( collections.detail_items.instance.where(where_obj)[0] );
			});
		},
		removeAll: function(){
			collections.detail_items.instance.set([]);
		}
	},

	isotope: {
		initCntnr: function(){
			if (!this.$isotopeCntnr) {
				this.$isotopeCntnr = this.$listContainer;
				this.$isotopeCntnr.isotope({
					itemSelector: this.isotopeChild, 
					layoutMode: 'fitRows',
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
						subject: '[data-subject] parseFloat',
						impact: '[data-impact] parseFloat'
					}
				});
			}
		},
		clearCntnr: function(){
			if (this.$isotopeCntnr) this.$isotopeCntnr = null;
		},
		addItem: function($el){
			app.helpers.isotope.initCntnr.call(this);
			this.$isotopeCntnr.isotope('appended', $el);
		}
	}
}