app = app || {};

app.helpers: {
	drawer: {
		// setMode: function(mode){
		// 	collections.drawer_items.instance.zeroOut('viewing');
		// 	models.section_mode.instance.set('mode', mode);
		// },
		setModeOnly: function(mode){
			models.section_mode.instance.set('mode', mode);
		},
		// changeActive: function(mode, uids){
		// 	app.helpers.drawer.setMode(mode);
		// 	if (uids == 'all') uids = app.helpers.drawer.getAllUids.call(this);
		// 	if (uids) collections.drawer_items.instance.setBoolByIds('viewing', this.listUid, uids, true);
		// },
		add: function(mode, uids){
			app.helpers.drawer.setModeOnly(mode);
			if (uids) collections.drawer_items.instance.setBoolByIds('viewing', this.listUid, uids, false); // This is an intermediate hack to make it so that it triggers the detail view on division switch, since the add to collection function only listens to a change in viewing
			if (uids) collections.drawer_items.instance.setBoolByIds('viewing', this.listUid, uids, true);
		},
		remove: function(mode, uids){
			app.helpers.drawer.setModeOnly(mode);
			if (uids) collections.drawer_items.instance.setBoolByIds('viewing', this.listUid, uids, false);
		},
		determineBehavior: function(){
			var behavior = 'radio';
			if (models.section_mode.instance.get('mode') == 'compare') behavior = 'checkbox';
			return behavior;
		},
		getAllUids: function(){
			var uids = [];
			// Add all the uids in our loaded articles and set the hash to that
			_.each(this.drawerData, function(drawerDatum) { uids.push(drawerDatum[this.listUid]) }, this);
			// Because we're finding the drawer item uids based on the detail items, we might have duplicates, such as in the approval river
			return uids;
		}
	},

	itemDetail: {
		go: function(listItemModel){
			var is_new = listItemModel.get('viewing'),
					uid = listItemModel.get(this.listUid),
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
			app.helpers.itemDetail.fetch.call(this, uid, action, destination);
			return this;
		},
		fetch: function(itemUid, action, cb){
			// If this uid already has a detailed Json object loaded, then return that
			// If not, then fetch it from the server
			var mode = models.section_mode.instance.get('mode');
			var loaded_matches = _.filter(this[mode].detailData, function(obj) { return obj[app.instance.detailUid] === itemUid });
			// console.log(loaded_matches)
			if (loaded_matches.length) {
				cb.call(this, loaded_matches);
			} else {
				// If we have no matches of detailed items but we're in removal mode, that's fine, we don't need to fetch anything
				// This occurs in approval river when you're deselecting an alert that has no pending items
				// There's no need to go and fetch things because there's nothing to fetch
				if (action != 'remove'){
					// TODO, handle fetching to the server
					var new_article_detail = new this[mode].Model();
					new_article_detail.fetch({
						data: itemUid, 
						success: function(model, response, options){
							console.log('success')
							// Response should be the array of matching json objects
							cb(response[0]);
						},
						error: function(model, response, options){
							console.log('Error fetching article ' + itemUid);
						}
		   		});
				}
			}
		},
		add: function(itemData){
			itemData.forEach(function(itemDatum){
				collections.detail_items.instance.add(itemDatum);
			});
		},
		remove: function(itemData){
			var that = this;
			itemData.forEach(function(itemDatum){
				var detailUid = itemDatum[that.detailUid],
						where_obj = {};
				where_obj[that.detailUid] = detailUid;
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