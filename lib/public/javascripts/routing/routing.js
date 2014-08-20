var routing = routing || {};
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
						uids : args[1],
						fragment : Backbone.history.fragment
					});
				}
			});

			// Initialize the routes for this section
			routing.init[section].call(this);
			// And any common routes we want for every page
			routing.init.common.call(this);
		},
		stripTrailingSlash: function(mode){
			app.helpers.drawer.setMode(mode);
			routing.router.navigate(mode, {replace: true});
		},
		readPage: function(mode, uids){
			mode = mode.replace(/\//g,''); // Get rid of any trailing slash
			uids = routing.helpers.diffUids.call(this, mode, uids);
			if (uids.exiting) app.helpers.drawer.remove.call(app.instance, mode, uids.exiting);
			if (uids.entering) app.helpers.drawer.add.call(app.instance, mode, uids.entering);
			if (!uids.exiting && !uids.exiting) app.helpers.drawer.setModeOnly(mode);
		},
		set: {
			radio: function(uid, trigger){
				if (_.isUndefined(trigger)) trigger = true;
				routing.router.navigate(models.section_mode.instance.get('mode')+'/' + uid, {trigger: trigger});
			},
			checkbox: function(articleUid){
				var hash = window.location.hash,
						hash_test = routing.helpers.getArticleUids(hash),
						exists = routing.helpers.exists(hash, articleUid);

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
					hash += (articleUid);
				} else {
					hash = hash.replace(new RegExp('(&|)'+articleUid, 'g'), '').replace('\/&', '\/');
				}
				routing.router.navigate(hash, {trigger: true});
			}
		}
	}),
	helpers: {
		diffUids: function(mode, newUids){
			var obj = {};
			if (newUids == 'all') newUids = app.helpers.drawer.getAllUids.call(app.instance).join('&');
			// If there's no history (first run) or the last state had no items enter all items
			if (mode == 'create-new') return false;
			if (!this.history.length || !this.history[this.history.length - 1].uids) { 
				if (!this.history[this.history.length - 2]){
					obj.entering = newUids; 
					return obj; 
				} else {
					return {}; // You end up here if you're coming from the `create-new` tab in the approval river and you just want to go back to what you had, without entering new stuff
				}
			}
			// TODO, handle null result
			var previous_uids = this.history[this.history.length - 1].uids.split('&'),
					newUids = newUids.split('&'),
					previous_uids_sorted = previous_uids.concat().sort(helpers.common.sortNumber),
					newUids_sorted = newUids.concat().sort(helpers.common.sortNumber),
					previous_mode = this.history[this.history.length - 1].mode;

			if (previous_uids == 'all') previous_uids = app.helpers.drawer.getAllUids.call(app.instance);

			// console.log(newUids, previous_uids)
			if (mode == 'compare'){
				if (newUids.length > previous_uids.length) { 
					if (previous_mode == 'compare') obj.entering = _.difference(newUids, previous_uids).join('&');
					else if (previous_mode == 'single') { 
						obj.entering = newUids.join('&');
						obj.exiting  = previous_uids.join('&');
					}
				} else if (newUids.length < previous_uids.length) { 
					obj.exiting =  _.difference(previous_uids, newUids).join('&'); 
				}
				else if ( _.isEqual(newUids_sorted, previous_uids_sorted) ) { 
					obj.entering = newUids.join('&') 
				}
				else if ( newUids.length == previous_uids.length ) { 
					obj.entering = newUids.join('&') 
					obj.exiting  = previous_uids.join('&') 
				}

			} else if (mode == 'single'){
				// If we're coming from compare mode
				if (previous_uids.length > 1) { 
					obj.entering = _.intersection(newUids, previous_uids).join('&'); 
					obj.exiting  = _.difference(previous_uids, newUids).join('&');
				} else if ( !_.isEqual(newUids_sorted, previous_uids_sorted) ) { 
					obj.entering = newUids.join('&'); 
					obj.exiting  = previous_uids.join('&'); 
				} else { obj.entering = newUids.join('&') } // If things are the same, just enter the new stuff
			} else if (mode == 'my-recipes') {
					obj.entering = newUids.join('&');
					obj.exiting  = previous_uids.join('&');
					// TODO, make it so that it incrementaly adds removes rows
					// Related to line 695
					// `if (uids) collections.drawer_items.instance.setBoolByIds('viewing', this.listUid, uids, false); // This is an intermediate hack to make it so that it triggers the detail view on division switch, since the add to collection function only listens to a change in viewing`
					// The detail items only update on change, so we're setting them to false, instead they should also have a listener on them that can be triggered while it's still in the collection
				


				// if (_.intersection(newUids, previous_uids).length) { 
				// 	obj.entering = _.difference(newUids, previous_uids).join('&');
				// 	obj.exiting  = _.difference(previous_uids, newUids).join('&');
				// 	console.log(previous_uids, newUids)
					
				// } else {
				// 	obj.entering = newUids.join('&');
				// 	obj.exiting  = previous_uids.join('&');
				// }
			}
			return obj;
		},
		getMode: function(hash){
			return hash.split('/')[0].replace(/#/g,'');
		},
		getArticleUids: function(hash){
			// If it has a second index then it's true
			// If it's empty this will be undefined or ""
			return hash.split('/')[1];
		},
		exists: function(hash, articleUid){
			var uid_regex = new RegExp(articleUid)
			return uid_regex.test(hash);
			return false;
		}
	}
}