(function(){
	'use-strict'

	var templates = {
		init: {
			articles: function(){
				// Templates are defined here on `init.go()`
				// We can't store references to them in Backbone views under `this.template`
				// Because the `template: templates.tagFactory` line is evaluated on compilation and thus it caches an undefined function
				// We can't run the templates, however, because then errors will be thrown when other pages' templates don't exist
				// Essentially, all of our things needs to be evaluated inside function on `init.go()`, otherwise some things won't exist.
				// You could pass in the template when you instantiate the view. It seems more organized, however, to define them here so they can share names,
				// which makes the views more generic. Whether we do that or this is pretty much all the same but I find it nice to define all the templates in one place.
				this.tagFactory = _.template( $('#tag-templ').html() );
				this.drawerListItemFactory = _.template( $('#article-summary-templ').html() );
				this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
				this.articleGridContainerMarkup = $('#article-grid-containter-templ').html();
				this.articleDetailRowFactory = _.template( $('#article-detail-row-templ').html() );
			},
			"approval-river": function(){
				this.drawerListItemFactory = _.template( $('#alert-templ').html() );
				this.drawerListItemStaticFactory = _.template( $('#alert-creator-templ').html() );
				this.alertFormFactory = _.template( $('#alert-form-templ').html() );
				this.riverItemFactory = _.template( $('#river-item-templ').html() );
			}
		},
		helpers: {
			date: function(isoDate){
				// TODO, Figure out proper timezone stuff
				var full_date_string = new Date(isoDate).toDateString(), // "2014-06-24" -> "Mon Jun 23 2014"
						month_day_year_arr = full_date_string.split(' ').slice(1,4), // Remove day of the week
						commafy = month_day_year_arr[0] + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
				return commafy.replace(' 0', ' '); // Strip leading zeros
			},
			formatEnabled: function(bool){
				if (bool) return 'Alert is active';
				return 'Alert not active';
			},
			getAssociatedItems: function(uid, itemKey, itemsObj){
				console.log(pageData,itemsObj)
				itemsObj = pageData[itemsObj];
				return _.filter(itemsObj, function(obj) { return obj[itemKey] == uid });
			},
			countAssociatedItems: function(uid, itemKey, itemsObj){
				var count = this.getAssociatedItems(uid, itemKey, itemsObj).length;
				// if (count == 0) count = 'None';
				return count;
			},
			bakeAlertUpdateForm: function(uid, service, settings){
				var that = this,
						markup = '',
						schema = {},
						schema_with_selects = {};

				$.extend(true, schema, _.filter(pageData.alertSchemas, function(alertSchema){ return alertSchema.service == service })[0].schema);
				// This doesn't need to be returned bc javascript will modify the origin object but it makes it more semantic
				schema_with_selects = this.combineFormSchemaWithVals(schema, settings);
				markup = this.bakeForm(service, schema_with_selects);
				return markup;
			},
			combineFormSchemaWithVals: function(schema_obj, settings_obj){
				// Make a copy of schema so that you don't pollute
				_.each(settings_obj, function(setting, fieldName){
					schema_obj[fieldName].selected = setting;
				});
				return schema_obj;
			},
			formJsonToMarkup: {
				text: function(service, prettyName, data){
					var name_id = _.uniqueId(service),
							value = this.escapeQuotes(data.selected) || '',
							markup;
					markup = '<div class="form-row">';
						markup += '<label for="'+name_id+'"> '+prettyName+'</label> ';
						markup += '<div class="input-text-container">';
							if (data.help && data.help.link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">How do I search?</a></div>'; 
							markup += '<input type="text" name="'+name_id+'" id="'+name_id+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
						markup += '</div>';
					markup += '</div>';
					return markup;
				},
				select: function(service, prettyName, data){
					var name_id = _.uniqueId(service),
							markup;
					markup = '<div class="form-row">';
					markup += '<label>'+prettyName + '</label> ';
					markup += '<select id="'+name_id+'">';
					_.each(data.options, function(option){
						var selected = '';
						if (data.selected == option) selected = 'selected';
						markup += '<option value="'+option+'" '+selected+'>'+option+'</option>';
					});
					markup += '</select>';
					markup += '</div>';
					return markup;
				},
			},
			bakeForm: function(service, schema){
				var form = '';
				_.each(schema, function(fieldData, fieldName){
					var pretty_name = this.prettyName(fieldName);
					form += this.formJsonToMarkup[fieldData.type].call(this, service, pretty_name, fieldData);
				}, this);
				return form;
			},
			prettyName: function(name){
				name = name.replace(/_/g, ' ');
		    return name.charAt(0).toUpperCase() + name.slice(1);
			},
			escapeQuotes: function(term){
				if (!term) return false;
				return term.replace(/"/g,'&quot;')
			}
		}
	}

	var modelCollectionHelpers = {
		toggle: function(key){
			this.set(key, !this.get(key));
		},
		getTrue: function(key){
			var where_obj = {}; where_obj[key] = true;
			return this.where(where_obj);
		},
		zeroOut: function(key){
			this.getTrue(key).forEach(function(model){
				model.set(key, false);
			});
		},
		setTrueByIds: function(trueKey, idKey, ids){
			ids = ids.split('&');
			ids.forEach(function(id){
				var where_obj = {}; where_obj[idKey] = id;
				this.where(where_obj)[0].set(trueKey, true);
			}, this);
		}
	}

	var models = {
		init: {
			articles: function(){
				// Keep track of whether we're in single view or comparison view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'single');
			},
			"approval-river": function(){
				// Keep track of whether we're in `my-alerts or 'create-new' view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'my-alerts');
			}
		},
		// Common
		section_mode: {
			"instance": null,
			"Model": Backbone.Model.extend({
				defaults: {
					mode: null
				}
			})
		},
		drawer_list_item: {
			"Model": Backbone.Model.extend({
				defaults: {
					viewing: false,
				},
				toggle: modelCollectionHelpers.toggle
			})
		},
		row_item: {
			"Model": Backbone.Model.extend({
				url: '/article-aggregate'
			})
		},
		detail_item: {
			"Model": Backbone.Model.extend({
				url: '/article-detail'
			})
		},
		river_item: {
			"Model": Backbone.Model.extend({
				url: '/river-item'
			})
		},
		// Article models
		tags: {
			"Model": Backbone.Model.extend({
				defaults: {
					active: false
				},
				toggle: modelCollectionHelpers.toggle
			})
		}
	}

	var collections = {
		init: {
			articles: function(){
				// Tags
				this.tags.instance = new this.tags.Collection(pageData.org.tags);
				// Article summaries
				this.drawer_items.instance = new this.drawer_items.Collection(pageData.articleSummaries);
				// This will populate based on our selection
				this.row_items.instance = new this.row_items.Collection([]);
				// This will also populate based on our selection
				this.detail_items.instance = new this.detail_items.Collection([]);
			},
			"approval-river": function(){
				// Alerts
				this.drawer_items.instance = new this.drawer_items.Collection(pageData.accountAlerts);
				// Alert creators
				this.drawer_items.instance_static = new this.drawer_items.Collection(pageData.alertSchemas);
				// This will populate based on our selection of drawer items
				this.detail_items.instance = new this.detail_items.Collection([]);
			}
		},
		tags: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.tags.Model,
				getTrue: modelCollectionHelpers.getTrue
			})
		},
		drawer_items: {
			"instance": null,
			"instance_static": null,
			"Collection": Backbone.Collection.extend({
				model: models.drawer_list_item.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut,
				setTrueByIds: modelCollectionHelpers.setTrueByIds
			})
		},
		// TODO, refactor to remove ununed collection functions
		row_items: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.detail_item.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut
			})
		},
		// TODO, refactor to remove ununed collection functions
		detail_items: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.detail_item.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut
			})
		}
	}

	var routing = {
		init: {
			go: function(section){
				this.router = new this.Router(section); // Pass the section to the `initialize` function, which will then call our sections specific routes
				Backbone.history.start();
			},
			common: function(){
				this.route(':mode/:uid', 'readPage');
				// If we've specified a starting route, then set it and trigger
				if (this.starting_route) this.route('', function(){ routing.router.navigate(this.starting_route, {trigger: true}) });
			},
			articles: function(){
				this.route(':mode(/)', 'stripTrailingSlash');
				this.starting_route = 'compare/'+app.helpers.drawer.getAllUids.call(app.instance);
			},
			"approval-river": function(){
				this.route(':mode(/)', 'readPage');
				this.starting_route = 'my-alerts/all';
			}
		},
		Router: Backbone.Router.extend({
			initialize: function(section){
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
				app.helpers.drawer.changeActive.call(app.instance, mode, uids);
			},
			set: {
				radio: function(uid){
					routing.router.navigate(models.section_mode.instance.get('mode')+'/' + uid, {trigger: true});
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

	// var load = {
	// 	summaries: {
	// 		next: function(amount){
	// 			amount = amount || 20; // TK default amount to lazy load next article by
	// 		},
	// 		by: {
	// 			tag: function(){
	// 				// Calculate the total order amount by agregating
	// 				// the prices of only the checked elements
	// 				var active_tags = collections.tags.instance.getTrue('active');

	// 				// TODO, do filtering articles based on active tags
	// 				return active_tags;
	// 			},
	// 			text: function(){
	// 				// TODO
	// 			}
	// 		}
	// 	},
	// 	article: function(articleModel){
	// 	}
	// }

	var app = {
		init: {
			articles: function(){
				this.instance = new this.Articles();
			},
			"approval-river": function(){
				this.instance = new this.ApprovalRiver();
			}
		},
		Articles: Backbone.View.extend({
			el: '#main-wrapper',

			initialize: function(){

				// Cache these selectors
				this.$tagList = $('#tag-list');
				this.$articleList = $('#article-list');
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$divisionSwitcher = $('.division-switcher');

				// Where is the full article data stores?
				// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
				this.drawerData = pageData.articleSummaries;
				this.single = {
					detailData: pageData.articleDetails,
					Model: models.detail_item.Model
				};
				this.compare = {
					detailData: pageData.articleDetails,
					Model: models.row_item.Model
				};

				this.compare.detailData = pageData.articleRowDetails;

				// What are your keys for article ids?
				// The values of these keys need to match
				// This defines the relationship between your drawer items and the detail items
				// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
				this.listUid = this.detailUid = 'article_uid';

				// Update hash and active collection on mode change
				this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateCollection);
				this.listenTo(models.section_mode.instance, 'change:mode', this.articleDetail.prepTheDom);

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:active', this.drawer.filter);

				// When a summary item has `viewing` set to true
				// Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
				this.listenTo(collections.drawer_items.instance, 'change:viewing', app.helpers.itemDetail.go);

				// Detailed data fetched by `article.set.go` is then either added or removed from a collection
				// Correspondingly the dom elements are baked or destroyed
				this.listenTo(collections.detail_items.instance, 'add', this.articleDetail.bake);
				this.listenTo(collections.detail_items.instance, 'remove', this.articleDetail.destroy);

				// Create views for every one of the models in the collection and add them to the page
				this.bake();
			},

			bake: function(){
				// Tags
				collections.tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$tagList.append(tag_view.render().el);
				}, this);

				// Article list
				collections.drawer_items.instance.each(function(article){
					var article_view = new views.DrawerListItem({model: article});
					this.$articleList.append(article_view.render().el);
				}, this);

				new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })

				return this;
			},
			articleDetail: {
				prepTheDom: function(sectionModel){
					if (sectionModel.get('mode') == 'compare'){
						this.$content.html( templates.articleGridContainerMarkup );
					}
				},	
				bake: function(detailModel){
					var mode = models.section_mode.instance.get('mode'),
							item_view;

					if (mode == 'single'){
						item_view = new views.ArticleDetail({model: detailModel});
						this.$content.html(item_view.render().el);
					} else {
						item_view = new views.ArticleDetailRow({model: detailModel});
						this.$content.find('#compare-grid .rows').append(item_view.render().el);
						item_view.update();
					}
					return this;
				},
				destroy: function(detailModel){
					detailModel.set('destroy', true);
				}
			},
			divisionSwitcher: {
				updateCollection: function(){
					// Remove all models in the collection, firing the remove event for each one
					// This as the effect of clearing their detail markup
					collections.detail_items.instance.remove( collections.detail_items.instance.models );
					return this;
				},
				updateHash: function(entering_mode){
					// Update the mode in the hash
					// Before you switch
					// Grab the current page numbers listed
					var hash_arr = current_uids = [];
					// var new_uids = ''; // Don't remember prior selection
					var new_uids = models.section_mode.instance.get('previous-uids') || ''; // Remember prior selection

					// Only save a previous state if you have a previous article state
					if ( routing.helpers.getArticleUids(window.location.hash) ){
						hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
						current_uids = hash_arr.slice(1, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
						// If we have something previously saved, used that
						// If not, our hash will just stay the same
						new_uids = new_uids || current_uids;
						// // If we're going into single mode and the hash has more than one uid, then we'll go to the first one
						if (entering_mode == 'single' && current_uids.length > 1) new_uids = current_uids[0];
						if (_.isArray(new_uids)) new_uids = new_uids.join('&');
					}
					// Set the url hash
					routing.router.navigate(entering_mode + '/' + new_uids, {trigger: true});

					// // Set these ids to `viewing: true`
					// app.helpers.drawer.changeActive.call(app.instance, mode, new_uids);
					// TODO, test the previous state save better once the comparison selection is working better
					// Possible use the `options.previousModels` on the collection to set this, and then you have the actual models
					// Don't safe the current_uid if it's an empty array
					if (_.isArray(current_uids) && current_uids.length === 0) current_uids = '';
					models.section_mode.instance.set('previous-uids', current_uids);
					return this;
				}
			},

			drawer: {
				filter: function(){
					// var active_tags = load.summaries.by.tag()
					return this;
				},
				bake: function(){
					// For changing the drawer list items based on filters
				}
			}
		}),

		ApprovalRiver: Backbone.View.extend({

			el: '#main-wrapper',

			events: {
				'click .view-all:not(.active)': 'resetFull'
			},

			initialize: function(){

				// Cache these selectors
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$alerts = $('#alerts');
				this.$alertCreators = $('#alert-creators');
				this.$divisionSwitcher = $('.division-switcher');
				this.$viewAll = $('.view-all');

				// Where are the river items stored?
				// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
				this.drawerData = pageData.accountAlerts;
				this['my-alerts'] = {
					detailData: pageData.riverItems,
					Model: models.river_item.Model
				}

				// What are your keys for article ids?
				// The values of these keys need to match
				// This defines the relationship between your drawer items and the detail items
				// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
				this.listUid = 'uid';
				this.detailUid = 'alert_uid';

				// Update hash and active collection on mode change
				// this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateHash);

				// When an alert item has `viewing` set to true
				// Fetch or find the associated river items for that alert and add that to the `collections.detail_items` collection
				this.listenTo(collections.drawer_items.instance, 'change:viewing', app.helpers.itemDetail.go);
				this.listenTo(collections.drawer_items.instance, 'change:viewing', this.river.resetViewAllBtn);

				// Detailed data fetched by `article.set.go` is then either added or removed from a collection
				// Correspondingly the dom elements are baked or destroyed
				this.listenTo(collections.detail_items.instance, 'add', this.river.bake);
				this.listenTo(collections.detail_items.instance, 'remove', this.river.destroy);

				// Create views for every one of the models in the collection and add them to the page
				this.bake();
			},

			bake: function(){
				// Alert list
				collections.drawer_items.instance.each(function(alert){
					// Make each visible on load
					var alert_view = new views.DrawerListItem({model: alert});
					this.$alerts.append(alert_view.render().el);
				}, this);

				// Alert creators
				collections.drawer_items.instance_static.each(function(alertCreator){
					// Make each visible on load
					var alert_creator_view = new views.DrawerListItemStatic({model: alertCreator });
					this.$alertCreators.append(alert_creator_view.render().el);
				}, this);

				// Alert creator forms
				collections.drawer_items.instance_static.each(function(alertCreator){
					// Make each visible on load
					var alert_creator_form_view = new views.AlertForm({model: alertCreator });
					this.$content.append(alert_creator_form_view.render().el);
				}, this);

				new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })

				return this;
			},

			resetFull: function(e){
				routing.router.navigate(models.section_mode.instance.get('mode')+'/all', {trigger: true});
				// routing.router.navigate(models.section_mode.instance.get('mode')+'/'+app.helpers.drawer.getAllUids.call(app.instance), {trigger: true});
				return this;
			},

			divisionSwitcher: {
				updateHash: function(entering_mode){
					// At this point, the mode has been changed but the hash has not
					var exiting_hash = window.location.hash,
							exiting_mode = routing.helpers.getMode(exiting_hash),
							exiting_uids = routing.helpers.getArticleUids(exiting_hash),
							previous_uids = models.section_mode.instance.get('previous-uids');

					var entering_hash = entering_mode;

					if (exiting_mode == 'my-alerts' && exiting_uids){
						models.section_mode.instance.set('previous-uids', exiting_uids)
					} else if (exiting_mode == 'create-new' && previous_uids){
						entering_hash += '/' + previous_uids;
					}

					routing.router.navigate(entering_hash, {trigger: true});
				}
			},
			river: {
				bake: function(detailModel){
					var mode = models.section_mode.instance.get('mode'),
							uid = detailModel.get('uid'),
							item_view;

					item_view = new views.RiverItem({model: detailModel});
					this.$content.append(item_view.render().el);

					return this;
				},
				destroy: function(detailModel){
					detailModel.set('destroy', true);
				},
				resetViewAllBtn: function(){
					// TODO, This should eventually be kicked into its own model that keeps track of filters more generally
					// If there are any active filters then the reset button is active
					var active_filters = collections.drawer_items.instance.where({viewing: true}).length,
							filters_enabled = active_filters == app.instance.drawerData.length;
					this.$viewAll.toggleClass('active', filters_enabled).find('input').prop('checked', filters_enabled);
				}
			}
		}),

		helpers: {
			drawer: {
				setMode: function(mode){
					collections.drawer_items.instance.zeroOut('viewing');
					models.section_mode.instance.set('mode', mode);
				},
				changeActive: function(mode, uids){
					app.helpers.drawer.setMode(mode);
					if (uids == 'all') uids = app.helpers.drawer.getAllUids.call(this);
					if (uids) collections.drawer_items.instance.setTrueByIds('viewing', this.listUid, uids);
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
					return uids.join('&');
				}
			},

			itemDetail: {
				go: function(listItemModel){
					var is_new = listItemModel.get('viewing'),
							uid = listItemModel.get(this.listUid),
							destination,
							action;

					console.log(uid)

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
					if (loaded_matches.length) {
						cb(loaded_matches);
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
					itemData.forEach(function(itemDatum){
						var detailUid = itemDatum.uid,
								where_obj = {};
						where_obj[this.detailUid] = detailUid;
						collections.detail_items.instance.remove( collections.detail_items.instance.where(where_obj)[0] );
					});
				},
				removeAll: function(){
					collections.detail_items.instance.set([]);
				}
			}
		}
	}

	var views = {
		// Common
		DrawerListItem: Backbone.View.extend({

			tagName: 'li',

			className: 'drawer-list-item',

			events: {
				'click .drawer-list-outer': 'setHash',
				'click .enable-switch': 'toggleEnabled',
				'click .cancel': 'toggleModal',
				'click .settings-switch': 'toggleModal',
				'click .modal-overlay': 'toggleModal',
				'submit form': 'saveModal'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
				this.listenTo(this.model, 'change:enabled', this.renderEnabled);
			},

			render: function(){
				var drawer_list_item_markup = templates.drawerListItemFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(drawer_list_item_markup);

				return this;
			},

			renderEnabled: function(){
				var enabled = this.model.get('enabled');
				this.$el.find('.enable-switch')
								.attr('data-enabled', enabled)
								.html(templates.helpers.formatEnabled(enabled));
			},

			toggleModal: function(e){
				views.helpers.toggleModal(e)
			},

			saveModal: function(e){
				console.log('Saved');
				this.toggleModal(e);
			},

			toggleEnabled: function(e){
				e.stopPropagation();
				this.model.set('enabled', !this.model.get('enabled'));
			},

			setActiveCssState: function(model){
				var uids = routing.helpers.getArticleUids(window.location.hash);
				if (uids != 'all'){
					this.$el.find('.drawer-list-outer').toggleClass('active', model.get('viewing'));
					this.$el.find('.inputs-container input').prop('checked', model.get('viewing'));
				} else {
					this.$el.find('.drawer-list-outer').toggleClass('active', false);
					this.$el.find('.inputs-container input').prop('checked', false);
				}
				return this;
			},

			// radioSet: function(){
			// 	var uid = this.model.get(app.instance.listUid);
			// 	if ( !this.model.get('viewing') ){
			// 		// Clear the last active article
			// 		collections.drawer_items.instance.zeroOut('viewing');
			// 		// Also clear anything that was in the content area
			// 		app.helpers.itemDetail.removeAll();

			// 		// And set this model to the one being viewed
			// 		this.model.set('viewing', true);
			// 	} else if ( models.section_mode.instance.get('mode') == 'my-alerts' ) {
			// 		// TODO, This should eventually be kicked into its own model that keeps track of filters more generally
			// 		$('.view-all').trigger('click');
			// 		uid = 'all';
			// 	}
			// 	return this;
			// },

			// checkboxSet: function(){
			// 	// This section behaves like a checkbox
			// 	this.model.set('viewing', !this.model.get('viewing'));
			// 	return this;
			// },

			setHash: function(){
				var behavior = app.helpers.drawer.determineBehavior();
				// Call the appropriate behavior
				routing.router.set[behavior]( this.model.get(app.instance.listUid) );
				return this;
			}

		}),
		DrawerListItemStatic: Backbone.View.extend({

			tagName: 'li',

			className: 'drawer-list-item',

			initialize: function(){
				// this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
				// this.listenTo(this.model, 'change:enabled', this.renderEnabled);
			},

			render: function(){
				var drawer_list_item_markup = templates.drawerListItemStaticFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(drawer_list_item_markup);

				return this;
			},
		}),
		DivisionSwitcher: Backbone.View.extend({

			events: {
				'click li': 'setHash'
			},
			initialize: function(){
				// Update the button active state and the hash
				this.listenTo(this.model, 'change:mode', this.updateActiveState);
				this.updateActiveState();
			},

			setHash: function(e){
				// Only set it if it's different, i.e. doesn't have an `active` class
				// This doesn't make that much of a difference because we listen for change events
				// But it's still nice
				var $el = $(e.currentTarget);
				if (!$el.hasClass('active')){
					var mode = $el.attr('data-mode');
					// Update the hash to the corresponding mode
					app.instance.divisionSwitcher.updateHash(mode);
				}
				return this;
			},

			updateActiveState: function(){

				var mode = this.model.get('mode');
				// Put a data attribute on the drawer for css purposes in the article view
				// This lets you have a different hover style when you hover over a checkbox article summary so you know you can do something to it
				$('#drawer').attr('data-mode', mode);
				$('#content').attr('data-mode', mode);
				// Set the active state on the li
				this.$el.find('li').removeClass('active');
				this.$el.find('li[data-mode="'+mode+'"]').addClass('active');
				// Show any els that have a data-mode attribute equal to the current mode
				$('.mode-content[data-mode="'+mode+'"]').show();
				// Hide any that don't have the right one
				$('.mode-content[data-mode!="'+mode+'"]').hide();

				return this;
			}
		}),
		// Article views
		Tag: Backbone.View.extend({

			tagName: 'li',

			className: 'tag-wrapper',

			events: {
				click: 'toggle'
			},

			initialize: function(){
				this.listenTo(this.model, 'change', this.styleLayout);
			},

			render: function(){
				var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), templates.helpers) );

				this.$el.html(tag_markup);
				// Set its border left and bg color to the appropriate color value in its data
				this.styleLayout();
				return this;
			},

			styleLayout: function(){
				this.$el.find('.tag-container')
								.css('border-left-color', this.model.get('color'))

				// If this is active
				// Give it an active class
				// And set its background color to the one defined in its model
				var is_active = this.model.get('active'),
				    color = (is_active) ? this.model.get('color') : 'auto';

				this.$el.toggleClass('active', is_active)
								.find('.tag-container')
								.css('background-color', color);

				return this;
			},

			toggle: function(){
				this.model.toggle('active');
				return this;
			}
		}),
		ArticleDetail: Backbone.View.extend({

			tagName: 'div',

			className: 'article-detail-wrapper',

			events: {
				// click: 'addEvent'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function(){
				var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_detail_markup);

				return this;
			},

			destroy: function(){
				if (this.model.get('destroy')) this.remove();
			}

		}),
		ArticleDetailRow: Backbone.View.extend({

			tagName: 'div',

			className: 'article-detail-row-wrapper',

			events: {
				'click .destroy': 'close'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function() {
				var article_detail_markup = templates.articleDetailRowFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_detail_markup);
				this.D$el = d3.select( this.el ).select('.article-detail-row-container').selectAll('.cell')
				return this;
			},

			update: function(){
				var data = this.model.toJSON();
				
				var cells = this.D$el.data([data]).enter(); // This should work with `datum` and not have to wrapp in an array, but that is giving an undefined enter selection.
				// Add the first two cells
				// Title
				cells.append('div')
						.classed('cell', true)
						.attr('data-layout', 'single')
						.html(function(d) { return d.title });

				// And date
				cells.append('div')
						.classed('cell', true)
						.attr('data-layout', 'single')
						.html(function(d) { return d.pub_datetime });

				var bullet_container = this.D$el.data(data.bullets).enter()
					.append('div')
						.classed('cell', true)
						.attr('data-layout', 'multi')
						.append('div')
							.classed('bullet-container', true);

				// The bullet
				var that = this;
				bullet_container.append('div')
							.classed('bullet', true)
							.style('width', function(d) { return that.helpers.calcSize(d, 'count') } );

				// The marker
				bullet_container.append('div')
							.classed('marker', true)
							.style('left', function(d) { return that.helpers.calcSize(d, 'median') } );

			},

			close: function(){
				var behavior = app.helpers.drawer.determineBehavior();
				// Call the appropriate behavior
				routing.router.set[behavior]( this.model.get(app.instance.detailUid) );
			},

			destroy: function(){
				if (this.model.get('destroy')) this.remove();
			},

			helpers: {
				calcSize: function(d, value){
					var val = d[value],
							max = d.max,
							scale = d3.scale.linear()
												.domain([0, max])
												.range([1, 100]);

					return scale(val).toString() + '%';
					
				}
			}

		}),
		// Approval river views
		RiverItem: Backbone.View.extend({
			tagName: 'div',

			className: 'article-detail-wrapper modal-parent',

			events: {
				'click .approval-btn-container[data-which="no"]': 'makeInsignificant',
				'click .approval-btn-container[data-which="yes"]': 'toggleModal',
				'click .cancel': 'toggleModal',
				'click .modal-overlay': 'toggleModal',
				'submit form': 'saveModal'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function() {
				var river_item_markup = templates.riverItemFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(river_item_markup);
				return this;
			},

			toggleModal: function(e){
				// Open up a modal that lets you assign it to something
				views.helpers.toggleModal(e);
			},

			saveModal: function(e){
				console.log('Saved');
				views.helpers.toggleModal(e);
				this.removeItem('save');
			},

			makeInsignificant: function(){
				this.removeItem('delete');
			},

			removeItem: function(mode){
				// Open up a modal that lets you assign it to something
				this.model.set('destroy', mode);
			},

			destroy: function(){
				var destroy_mode = this.model.get('destroy');
				// If it's a plain boolean, then remove it. That's used for switching drawer items
				if (destroy_mode === true) this.remove();
				// If it's fancier, then it means we've gone through some dis/approval and we can have more options
				if (destroy_mode == 'delete') {
					// Add styles to fade out in red or something
					this.remove();
				} else if (destroy_mode == 'save'){
					// Fade out in green or something
					this.remove();
				}
			}

		}),
		AlertForm: Backbone.View.extend({
			tagName: 'div',

			className: 'article-detail-wrapper mode-content',

			events: {
				'submit form': 'save'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function() {
				var river_item_markup = templates.alertFormFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(river_item_markup).attr('data-mode','create-new');
				return this;
			},

			save: function(){

			}

		}),

		// Shared functions across views
		helpers: {
			toggleModal: function(e){
				e.preventDefault();
				e.stopPropagation();
				var $tray = $(e.currentTarget).parents('.modal-parent').find('.modal-outer');
				$tray.toggleClass('active', !$tray.hasClass('active'));
				// This will set `overflow: hidden` so you can't horizontal scroll
				$('body').attr('data-modal', $tray.hasClass('active'));

				// Center it
				this.centerishInViewport( $tray.find('.modal-inner') );
			},
			centerishInViewport: function($el){
				// Center the element horizontally and in the top third vertically
				var el_width = $el.outerWidth(),
				    el_height = $el.outerHeight(),
				    v_width = $(window).width(),
				    v_height = $(window).height();

				$el.css({
					top: (v_height/2 - (el_height))/v_height*100 + '%',
					left: (v_width/2 - (el_width/2))/v_width*100 + '%' // This line calculation can be improved
				});
			}
		}
	}

	init = {
		go: function(){
			// Call the page specific functions
			var section = $('body').attr('data-section');
			// Their `this` should be the root object so you can still say `this.` even though you're nested in the object
			templates.init[section].call(templates);
			models.init[section].call(models);
			collections.init[section].call(collections);
			app.init[section].call(app);
			routing.init.go.call(routing, section);
		}
	}

	init.go();

}).call(this);