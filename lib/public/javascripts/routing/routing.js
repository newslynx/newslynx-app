routing = {
	Router: Backbone.Router.extend({
		initialize: function(section){
			// Stash an array of history states
			this.history = [];
			this.listenTo(this, 'route', function (name, args) {
				// For some reason, a second event is triggered where args is undefined, it could be a replacement call or something
				// For now, just ignore when undefined, when it's empty it's null
				if (!_.isUndefined(args[1])){
					this.history.push({
						name : name,
						mode : args[0],
						ids : args[1],
						fragment : Backbone.history.fragment
					});
				}
			});

			// Initialize the routes for this section
			routing.init[section].call(this);
			// And any common routes we want for every page
			routing.init.common.call(this);
		},
		loadRecipe: function(mode, ids){
			console.log('loadrecipe')
			mode = mode.replace(/\//g,''); // Get rid of any trailing slash
			ids = routing.helpers.diffIds.call(this, mode, ids);
			if (mode == 'my-recipes'){
				app.instance.model.set('view-all', false);
			}
			this.setModeOnly(mode);
			if (ids.exiting) this.addRemove.call(app.instance, mode, ids.exiting, false);
			if (ids.entering) this.addRemove.call(app.instance, mode, ids.entering, true);
		},
		loadAllInSection: function(mode){
			console.log('load all in section')
			this.setModeOnly(mode);
			this.enableAll.call(app.instance);
		},
		setModeOnly: function(mode){
			console.log('set mode only')
			models.section_mode.set('mode', mode);
		},
		compareArticles: function(ids){
			models.section_mode.compare.current_ids = ids;
			var is_compare_mode = (models.section_mode.get('mode') == 'compare'),
					compare_models;
			console.log('comparing', is_compare_mode);
			// If it's not compare mode then set it, which will cascade results
			if (!is_compare_mode){
				models.section_mode.set('mode', 'compare');
			} else {
				// Rehydrate ids into models
				// Ids is the string of `&` delimited ids from the hash
				compare_models = ids.split('+').map(function(id){ return _.findWhere(collections.po.article_summaries.items, {id: +id}); });
				collections.article_comparisons.instance.set(compare_models, {merge: true});
			}
		},
		detailArticle: function(id){
			console.log('detail article')
			var is_detail_mode = (models.section_mode.get('mode') == 'detail');

			// Make sure this is a number
			id = +id;
			if (!is_detail_mode){
				app.instance.staged_article_detail = id;
				models.section_mode.set('mode', 'detail');
			} else {
				app.instance.detail.getDetailModelFromId.call(app.instance, id, app.instance.detail.loadPage)
			}
		},
		addRemove: function(mode, ids, show){
			if (ids) {
				collections.recipes.instance.setBoolByIds('viewing', this.listId, ids, show);
			}
		},
		enableAll: function(){
			app.instance.model.set('view-all', true);
			models.all_alerts.instance.set('viewing', true);
		},

		set: {
			radio: function(id, trigger){
				if (_.isUndefined(trigger)) trigger = true;
				routing.router.navigate(models.section_mode.get('mode')+'/' + id, {trigger: trigger});
			},
			checkbox: function(articleId){
				var hash = window.location.hash,
						hash_test = routing.helpers.getArticleIds(hash),
						exists = routing.helpers.exists(hash, articleId);

				if ( !exists ){
					// If it has a hash, add an ampersand
					// If not, add a trailing slash
					// Unless it already ends in a slash
					if ( hash_test ) {
						hash += '&';
					} else if (hash.substr(hash.length - 1, 1) != '/') {
						hash += '/';
					}
					// If it is not new and exists
					// Remove id from the hash and the leading ampersand if it exists
					hash += (articleId);
				} else {
					hash = hash.replace(new RegExp('(&|)'+articleId, 'g'), '').replace('\/&', '\/');
				}
				routing.router.navigate(hash, {trigger: true});
			}
		}
	}),
	helpers: {
		diffIds: function(mode, newIds){
			var obj = {};
			// if (newIds == 'all') newIds = app.helpers.drawer.getAllIds.call(app.instance).join('&');
			// If there's no history (first run) or the last state had no items enter all items
			if (mode == 'create-new') {
				return false;
			}
			if (!this.history.length || !this.history[this.history.length - 1].ids) { 
				// If you don't have one history back but and you don't have two history back or you have two back but it's empty
				// Return what you're going to
				// TODO, re-logic this to get proper exiting for alerts
				if (!this.history[this.history.length - 2] || mode == 'my-recipes'){
					obj.entering = newIds; 
					return obj; 
				} else {
					// You end up here if you're coming from the `create-new` tab in the approval river and you just want to go back to what you had, without entering new stuff
					return {};
				}
			}
			// TODO, handle null result
			var previous_ids = this.history[this.history.length - 1].ids.split('+'),
					newIds = newIds.split('+'),
					previous_ids_sorted = previous_ids.concat().sort(helpers.common.sortNumber),
					newIds_sorted = newIds.concat().sort(helpers.common.sortNumber),
					previous_mode = this.history[this.history.length - 1].mode;

			// TODO, check if this is the case now that we're not using `all`
			// console.log('previous id', previous_ids)
			if (mode == 'my-recipes' && !previous_ids) previous_ids = app.helpers.drawer.getAllIds.call(app.instance);

			// // console.log(newIds, previous_ids)
			// if (mode == 'compare'){
			// 	if (newIds.length > previous_ids.length) { 
			// 		if (previous_mode == 'compare') obj.entering = _.difference(newIds, previous_ids).join('&');
			// 		else if (previous_mode == 'single') { 
			// 			obj.entering = newIds.join('&');
			// 			obj.exiting  = previous_ids.join('&');
			// 		}
			// 	} else if (newIds.length < previous_ids.length) { 
			// 		obj.exiting =  _.difference(previous_ids, newIds).join('&'); 
			// 	}
			// 	else if ( _.isEqual(newIds_sorted, previous_ids_sorted) ) { 
			// 		obj.entering = newIds.join('&') 
			// 	}
			// 	else if ( newIds.length == previous_ids.length ) { 
			// 		obj.entering = newIds.join('&') 
			// 		obj.exiting  = previous_ids.join('&') 
			// 	}

			// } else if (mode == 'single'){
			// 	// If we're coming from compare mode
			// 	if (previous_ids.length > 1) { 
			// 		obj.entering = _.intersection(newIds, previous_ids).join('&'); 
			// 		obj.exiting  = _.difference(previous_ids, newIds).join('&');
			// 	} else if ( !_.isEqual(newIds_sorted, previous_ids_sorted) ) { 
			// 		obj.entering = newIds.join('&'); 
			// 		obj.exiting  = previous_ids.join('&'); 
			// 	} else { obj.entering = newIds.join('&') } // If things are the same, just enter the new stuff
			if (mode == 'my-recipes') {
					obj.entering = newIds.join('&');
					obj.exiting  = previous_ids.join('&');
					// TODO, make it so that it incrementaly adds removes rows
					// Related to line 695
					// `if (ids) collections.drawer_items.instance.setBoolByIds('viewing', this.listId, ids, false); // This is an intermediate hack to make it so that it triggers the detail view on division switch, since the add to collection function only listens to a change in viewing`
					// The detail items only update on change, so we're setting them to false, instead they should also have a listener on them that can be triggered while it's still in the collection
				


				// if (_.intersection(newIds, previous_ids).length) { 
				// 	obj.entering = _.difference(newIds, previous_ids).join('&');
				// 	obj.exiting  = _.difference(previous_ids, newIds).join('&');
				// 	console.log(previous_ids, newIds)
					
				// } else {
				// 	obj.entering = newIds.join('&');
				// 	obj.exiting  = previous_ids.join('&');
				// }
			}
			return obj;
		},
		getMode: function(hash){
			return hash.split('/')[0].replace(/#/g,'');
		},
		getArticleIds: function(hash){
			// If it has a second index then it's true
			// If it's empty this will be undefined or ""
			return hash.split('/')[1];
		},
		exists: function(hash, articleId){
			var id_regex = new RegExp(articleId)
			return id_regex.test(hash);
			return false;
		}
	}
}