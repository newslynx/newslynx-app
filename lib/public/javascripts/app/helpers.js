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
					pending = listItemModel.get('pending'),
					min_timestamp = collections.all_detail_items.instance.meta('timestamp'),
					destination,
					action;

			// If it is a `viewing` article, fetch its data
			if (is_new) {
				action = 'add';
				destination = app.helpers.itemDetail.add;
				// app.helpers.itemDetail.fetch.call(this, id, action, destination);
				app.helpers.itemDetail.fetch.call(this, id, action, destination, pending, min_timestamp);
			}
			return this;
		},
		fetch: function(itemId, action, cb, pending, minTimestamp){
			var page_limit = 5;

			// If this id already has a detailed Json object loaded, then return that
			// If not, then fetch it from the server
			var mode = models.section_mode.get('mode');
			// var loaded_matches = collections.all_detail_items.instance.where({recipe_id: itemId}); 
			var loaded_matches = collections.all_detail_items.instance.filterAlerts(app.instance.detailId, itemId);
			// var loaded_matches = _.filter(this[mode].detailData, function(obj) { return obj[app.instance.detailId] === itemId });

			// Only proceed with loading the ones in memory if you have loaded matches but you're not in `my-recipes` mode // not sure why this exists
			// Or if you are in `my-recipes mode, then only proceed if the total number pending is how many you have
			// console.log(loaded_matches.length, 'out of' , pending)
			if ((loaded_matches.length && mode != 'my-recipes') || (mode == 'my-recipes' && (loaded_matches.length >= page_limit || loaded_matches.length == pending))) {
				// console.log('loading',loaded_matches.length,'current maches')
				cb.call(this, loaded_matches);
				// Reload layout via hack
				app.helpers.isotope.relayout();
			} else {
				// If we have no matches of detailed items but we're in removal mode, that's fine, we don't need to fetch anything
				// This occurs in approval river when you're deselecting an alert that has no pending items
				// There's no need to go and fetch things because there's nothing to fetch
				// if (action != 'remove'){
				var new_article_detail = new this[mode].Model({id: itemId}),
						options = {};
				if (minTimestamp) {
						options = { 
							data: { before: minTimestamp},
							processData: true,
							success: function(model, response, options){
								console.log('fetched', response.results.length, 'new models')
								// console.log(response.results.length, response)
								// Add the new stuff to our collection keeping track of everything
								collections.all_detail_items.instance.add(response.results);
								// Response should be the array of matching json objects to add.
								// We combine this with `loaded_matches` to dispaly everything we have so far
								var matches_loaded_so_far = loaded_matches.concat(response.results);
								// console.log(matches_loaded_so_far)
								cb(matches_loaded_so_far);
							},
							error: function(model, response, options){
								console.log('Error fetching ' + itemId);
								// cb([]);
							}
						}
				}
				// console.log('fetching new stuff', itemId, options)
				new_article_detail.fetch(options);
				// }
			}
		},
		add: function(itemData){
			collections.detail_items.instance.set(itemData);
			app.instance.$isotopeCntnr.isotope('layout');
			// console.log(collections.detail_items.instance)
		}
		// remove: function(itemData){
		// 	// console.log('removing', itemData)
		// 	var that = this;
		// 	itemData.forEach(function(itemDatum){
		// 		var detailId = itemDatum[that.detailId],
		// 				where_obj = {};
		// 		where_obj[that.detailId] = detailId;
		// 		console.log('remove where', collections.detail_items.instance.where(where_obj))
		// 		collections.detail_items.instance.remove( collections.detail_items.instance.where(where_obj)[0] );
		// 	});
		// 	// console.log('removed all')
		// },
		// removeAll: function(){
		// 	collections.detail_items.instance.set([]);
		// }
	},

	isotope: {
		initCntnr: function(){
			if (!this.$isotopeCntnr) {
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
		},
		relayout: function(){
			console.log('here')
			app.instance.$isotopeCntnr.isotope({sortBy: 'timestamp', sortAscending: false});
			app.instance.$isotopeCntnr.isotope('layout');
		}
	}
}