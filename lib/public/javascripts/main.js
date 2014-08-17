(function(){
	'use-strict'

	var helpers = {
		sortNumber: function(a,b) {
			return a - b;
		}
	}

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
				this.articleGridContainerMarkup = $('#article-grid-container-templ').html();
				this.articleDetailRowFactory = _.template( $('#article-detail-row-templ').html() );
			},
			"approval-river": function(){
				this.drawerListItemFactory = _.template( $('#recipe-templ').html() );
				this.drawerListItemStaticFactory = _.template( $('#recipe-creator-templ').html() );
				this.recipeFormFactory = _.template( $('#recipe-form-templ').html() );
				this.riverItemFactory = _.template( $('#river-item-templ').html() );

			},
			settings: function(){
				this.settingsFactory = _.template( $('#settings-templ').html() );
				this.impactTagInputFactory = _.template( $('#impact-tag-input-templ').html() );
				this.multiInputFactory = _.template( $('#multi-input-templ').html() );
				this.multiInputDoubleFactory = _.template( $('#multi-input-double-templ').html() );
			}
		},
		helpers: {
			toLowerCase: function(str){
				return str.toLowerCase();
			},
			toTitleCase: function(str){
				return (str.charAt(0).toUpperCase() + str.slice(1, str.length));
			},
			serviceFromSource: function(src){
				// source data is stored as `:service-:task` name, e.g. `google-alert`, `reddit-search`. Split by `-` and return the first node.
				return src.split('-')[0];
			},
			prettyPrintSource: function(src){
				src = src.replace(/-/g, ' ');
				return templates.helpers.toTitleCase(src);
			},
			toUserTimezone: function(utcDate){
				var utc_date = new Date(utcDate),
						user_timezone_date = new Date(new Date(utcDate).setHours(utc_date.getHours() + parseFloat(pageData.org.timezone) ));
				
				return user_timezone_date;
			},
			date: function(utcDate){
				var user_timezone_date = templates.helpers.toUserTimezone(utcDate);
				// TODO, Figure out proper timezone stuff
				var full_date_string = user_timezone_date.toDateString(),
						month_day_year_arr = full_date_string.split(' ').slice(1,4), // Remove day of the week
						commafy = month_day_year_arr[0] + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
				return commafy.replace(' 0', ' '); // Strip leading zeros, returns `Jun 23, 2014`
			},
			conciseDate: function(utcDate){
				var user_timezone_date = templates.helpers.toUserTimezone(utcDate);
				var full_date_string = user_timezone_date.toISOString(), 
						month_day_year_arr = full_date_string.split('T')[0]//.replace(/-0/g, '-'), // Remove the time, strip leading zeros
						parts_arr = month_day_year_arr.split('-');
				return parts_arr[1] + '-' + parts_arr[2] + '-' + parts_arr[0].substr(2,2) // returns `6-24-14`
			},
			formatEnabled: function(bool){
				if (bool) return 'Recipe is active';
				return 'Recipe not active';
			},
			getAssociatedItems: function(uid, itemKey, itemsObj){
				itemsObj = pageData[itemsObj];
				return _.filter(itemsObj, function(obj) { return obj[itemKey] == uid });
			},
			countAssociatedItems: function(uid, itemKey, itemsObj){
				var count = this.getAssociatedItems(uid, itemKey, itemsObj).length;
				// if (count == 0) count = 'None';
				return count;
			},
			bakeRecipeUpdateForm: function(uid, source, settings){
				var that = this,
						markup = '',
						schema = {},
						schema_with_selects = {};

				$.extend(true, schema, _.filter(pageData.recipeSchemas, function(recipeSchema){ return recipeSchema.source == source })[0].schema);
				// This doesn't need to be returned bc javascript will modify the origin object but it makes it more semantic
				schema_with_selects = this.combineFormSchemaWithVals(schema, settings);
				markup = this.bakeForm(source, schema_with_selects);
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
				text: function(source, prettyName, data){
					var name_id = _.uniqueId(source),
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
				select: function(source, prettyName, data){
					var name_id = _.uniqueId(source),
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
				checkbox: function(source, prettyName, data){
					var name_id = _.uniqueId(source),
							markup;
					markup = '<div class="form-row">';
					markup += '<label>'+prettyName + '</label> ';
					markup += '<input type="checkbox" ' + ((data.selected) ? 'checked' : '' ) + ' />';
					return markup;
				}
			},
			bakeForm: function(source, schema){
				// console.log(schema)
				var form = '';
				_.each(schema, function(fieldData, fieldName){
					var pretty_name = this.prettyName(fieldName);
					form += this.formJsonToMarkup[fieldData.type].call(this, source, pretty_name, fieldData);
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
		setBoolByIds: function(trueKey, idKey, ids, bool){
			ids = ids.split('&');
			ids.forEach(function(id){
				var where_obj = {}; where_obj[idKey] = id;
				this.where(where_obj)[0].set(trueKey, bool);
			}, this);
		},
		addTagsFromId: function(objectList){
			objectList.forEach(function(item){
				item.subject_tags = item.subject_tags.map(function(d) {return pageData.org['subject_tags'].filter(function(f){ return f.uid == d })[0] });
				item.events.forEach(function(ev){
					// console.log(pageData.org['impact_tags'])
					ev.impact_tags = ev.impact_tags.map(function(d) {return pageData.org['impact_tags'].filter(function(f){ return f.uid == d })[0] });
				})
			});
			return objectList;
		}
	}

	var models = {
		init: {
			articles: function(){
				// Keep track of whether we're in single view or comparison view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'single');
			},
			"approval-river": function(){
				// Keep track of whether we're in `my-recipes or 'create-new' view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'my-recipes');
			},
			settings: function(){
				this.org.instance = new this.org.Model(pageData.org);
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
		},
		// Settings
		org: {
			"Model": Backbone.Model.extend({
				idAttribute: 'domain', 
				urlRoot: '/api/organizations'
			})
		}
	}

	var collections = {
		init: {
			articles: function(){
				// Tags
				this.subject_tags.instance = new this.subject_tags.Collection(pageData.org.subject_tags);
				this.impact_tags.instance = new this.impact_tags.Collection(pageData.org.impact_tags);
				// Article summaries
				this.drawer_items.instance = new this.drawer_items.Collection( pageData.articleSummaries );
				// This will populate based on our selection
				this.row_items.instance = new this.row_items.Collection([]);
				// This will also populate based on our selection
				this.detail_items.instance = new this.detail_items.Collection([]);
			},
			"approval-river": function(){
				// Recipes
				this.drawer_items.instance = new this.drawer_items.Collection(pageData.accountRecipes);
				// Recipes creators
				this.drawer_items.instance_static = new this.drawer_items.Collection(pageData.recipeSchemas);
				// This will populate based on our selection of drawer items
				this.detail_items.instance = new this.detail_items.Collection([]);
			},
			settings: function(){
				// Nothing to see here folks
			}
		},
		impact_tags: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.tags.Model,
				getTrue: modelCollectionHelpers.getTrue
			})
		},
		subject_tags: {
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
				setBoolByIds: modelCollectionHelpers.setBoolByIds,
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
				this.starting_route = 'compare/'+app.helpers.drawer.getAllUids.call(app.instance).join('&');
			},
			"approval-river": function(){
				this.route(':mode(/)', 'readPage');
				this.starting_route = 'my-recipes/all';
			},
			settings: function(){
				// Nothing to see here folks, this page doesn't have any navigation
			}
		},
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
						previous_uids_sorted = previous_uids.concat().sort(helpers.sortNumber),
						newUids_sorted = newUids.concat().sort(helpers.sortNumber),
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

	// TODO, switch back to `var app`
	window.app = {
		init: {
			articles: function(){
				this.instance = new this.Articles();
			},
			"approval-river": function(){
				this.instance = new this.ApprovalRiver();
			},
			settings: function(){
				this.instance = new this.Settings({model: models.org.instance});
			}
		},
		Articles: Backbone.View.extend({
			el: '#main-wrapper',

			initialize: function(){

				// Cache these selectors
				this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
				this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
				this.$articleList = $('#article-list');
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$divisionSwitcher = $('.division-switcher');


				this.isotopeCntnr = '.rows';
				this.isotopeChild = '.article-detail-row-wrapper';

				// Where is the full article data stores?
				// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
				this.drawerData = pageData.articleSummaries;
				this.single = {
					detailData: modelCollectionHelpers.addTagsFromId(pageData.articleDetails),
					Model: models.detail_item.Model
				}
				this.compare = {
					detailData: pageData.articleSummaries,
					Model: models.row_item.Model
				}


				// What are your keys for article ids?
				// The values of these keys need to match, but not necessarily the keys themselves
				// The system is setup so these keys can be different, but they still point to the same unique identifier
				// This defines the relationship between your drawer items and the detail items
				// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
				this.listUid = 'uid'; // The key on thes summary object that points to the main article id
				this.detailUid = 'article_uid'; // The key on thes detail object that points to the main article id

				// Update hash and active collection on mode change
				this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateCollection);
				this.listenTo(models.section_mode.instance, 'change:mode', this.articleDetail.prepTheDom);

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.subject_tags.instance, 'change:active', this.drawer.filter);
				this.listenTo(collections.impact_tags.instance, 'change:active', this.drawer.filter);

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
				// Article tags
				collections.subject_tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$subjectTagList.append(tag_view.render().el);
				}, this);
				// Impact tags
				collections.impact_tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$impactTagList.append(tag_view.render().el);
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
					// TODO, maybe this should be dealt with through the divisionSwitcher.updateCollection
					if (sectionModel.get('mode') == 'compare'){
						var article_grid =  new views.ArticleDetailGrid()
						this.$content.html( article_grid.render().el );
					} 
					this.$listContainer = $('#compare-grid .rows');

				},	
				bake: function(detailModel){
					var mode = models.section_mode.instance.get('mode'),
							item_view,
							item_el;

					if (mode == 'single'){
						item_view = new views.ArticleDetail({model: detailModel});
						item_el = item_view.render().el;
						this.$content.html(item_el);

						item_view.bakeInteractiveBits();
						// app.helpers.isotope.addItem.call(this, item_el);
					} else {
						app.helpers.isotope.initCntnr.call(this);
						item_view = new views.ArticleDetailRow({model: detailModel});
						item_el = item_view.render().el;
						this.$listContainer.append(item_el);

						item_view.update(app.helpers.isotope.addItem);
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
				updateHash: function(entering_mode, new_uid){
					app.helpers.isotope.clearCntnr.call(app.instance);
					// Update the mode in the hash
					// Before you switch
					// Grab the current page numbers listed
					var hash_arr = current_uids = [];
					// var new_uids = ''; // Don't remember prior selection
					var new_uids = new_uid || models.section_mode.instance.get('previous-uids') || ''; // Remember prior selection, or passed in selection
					// Only save a previous state if you have a previous article state
					if ( routing.helpers.getArticleUids(window.location.hash) ){
						hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
						current_uids = hash_arr.slice(1, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
						// If we have something previously saved, used that
						// If not, our hash will just stay the same
						new_uids = new_uids || current_uids;
						// // If we're going into single mode and the hash has more than one uid, then we'll go to the first one
						if (entering_mode == 'single' && current_uids.length > 1 && !new_uid) new_uids = current_uids[0];
						if (_.isArray(new_uids)) new_uids = new_uids.join('&');
					}
					// Set the url hash
					routing.router.navigate(entering_mode + '/' + new_uids, {trigger: true});

					// // Set these ids to `viewing: true`
					// app.helpers.drawer.changeActive.call(app.instance, mode, new_uids);
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
				'click .view-all:not(.active)': 'resetFull',
				'click .scroll-to': 'scrollTo'
			},

			initialize: function(){

				// Cache these selectors
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$listContainer = $('#river-items-container');
				this.$recipes = $('#recipes');
				this.$recipeCreators = $('#recipe-creators');
				this.$divisionSwitcher = $('.division-switcher');
				this.$viewAll = $('.view-all');

				this.isotopeCntnr = '#river-items-container';
				this.isotopeChild = '.article-detail-wrapper';

				// Where are the river items stored?
				// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
				this.drawerData = pageData.accountRecipes;
				this['my-recipes'] = {
					detailData: pageData.riverItems,
					Model: models.river_item.Model
				}

				// What are your keys for article ids?
				// The values of these keys need to match
				// This defines the relationship between your drawer items and the detail items
				// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
				this.listUid = 'uid';
				this.detailUid = 'source';

				// Update hash and active collection on mode change
				// this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateHash);

				// When an recipe item has `viewing` set to true
				// Fetch or find the associated river items for that recipe and add that to the `collections.detail_items` collection
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
				// Recipe list
				collections.drawer_items.instance.each(function(recipe){
					// Make each visible on load
					var recipe_view = new views.DrawerListItem({model: recipe});
					this.$recipes.append(recipe_view.render().el);
				}, this);

				// Recipe creators
				collections.drawer_items.instance_static.each(function(recipeCreator){
					// Make each visible on load
					var recipe_creator_view = new views.DrawerListItemStatic({model: recipeCreator });
					this.$recipeCreators.append(recipe_creator_view.render().el);
				}, this);

				// Recipe creator forms
				collections.drawer_items.instance_static.each(function(recipeCreator){
					// Make each visible on load
					var recipe_creator_form_view = new views.RecipeForm({model: recipeCreator });
					this.$content.append(recipe_creator_form_view.render().el);
				}, this);

				new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })
				app.helpers.isotope.initCntnr.call(this);

				return this;
			},

			resetFull: function(e){
				routing.router.navigate(models.section_mode.instance.get('mode')+'/all', {trigger: true});
				// routing.router.navigate(models.section_mode.instance.get('mode')+'/'+app.helpers.drawer.getAllUids.call(app.instance), {trigger: true});
				return this;
			},

			scrollTo: function(e){
				var dest = $(e.currentTarget).attr('data-destination');
				this.$content.animate({
					scrollTop: (this.$content.scrollTop() + $('#'+dest+'-recipe').position().top - parseFloat(this.$content.css('padding-top')))
				}, 200);
			},

			divisionSwitcher: {
				updateHash: function(entering_mode){
					// At this point, the mode has been changed but the hash has not
					var exiting_hash = window.location.hash,
							exiting_mode = routing.helpers.getMode(exiting_hash),
							exiting_uids = routing.helpers.getArticleUids(exiting_hash),
							previous_uids = models.section_mode.instance.get('previous-uids') || 'all';

					var entering_hash = entering_mode;

					if (exiting_mode == 'my-recipes' && exiting_uids){
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
							item_view,
							item_el;

					item_view = new views.RiverItem({model: detailModel});
					item_el = item_view.render().el;
					this.$listContainer.append(item_el);
					app.helpers.isotope.addItem.call(app.instance, item_el);

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
		
		Settings: Backbone.View.extend({
			el: '#main-wrapper',

			events: {
				'click button.add': 'addItem',
				'click .destroy': 'removeItem',
				'click #save': 'saveDataToServer'
			},

			initialize: function(){

				// Cache these selectors
				this.$drawer = $('#drawer');
				this.$content = $('#content');

				// Instantiate settings view
				this.instantiate();
			},

			// makeTemplate: function(){
			// 	pageData.settingsSchema.forEach(function(sectionGroup){
			// 		templates.sectionGroupFactory(sectionGroup)
			// 	});
			// },

			instantiate: function(){
				var markup = templates.settingsFactory( this.model.toJSON() );
				this.$content.html(markup);
				this.initColorPicker(this.$content);
			},

			initColorPicker: function($el){
				var that = this;
				$el.find('.color-picker').each(function(){
					var group = $(this).attr('data-group');
					$(this).spectrum({
						preferredFormat: "hex",
						showInput: true,
						showPalette: true,
						chooseText: 'Choose',
						palette: [that.palettes[group]],
						change: function(color){
							// Save the hex back to the object for reading back laters
							$(this).val(color.toHexString());
						}
					});
				});
			},

			palettes: {
				articles: ['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928','#a6cee3','#b2df8a','#fb9a99','#fdbf6f','#cab2d6'],
				impact: ['#8dd3c7','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
			},

			addItem: function(e){
				var $inputsContainer = $(e.currentTarget).siblings('.inputs-container'),
					new_item = {},
					placeholders,
					$newItem;

				new_item.flag = $inputsContainer.attr('data-flag');
				new_item.group = $inputsContainer.attr('data-group');
				new_item.keys = []
				$inputsContainer.find('.input-item').each(function(){
					new_item.keys.push($(this).attr('data-key'));
				});
				if ($inputsContainer.attr('data-layout') == 'double'){
					placeholders = JSON.parse( $inputsContainer.attr('data-placeholder') );
					new_item.placeholder0 = placeholders[0];
					new_item.placeholder1 = placeholders[1];
					$inputsContainer.append( templates.multiInputDoubleFactory(new_item) );
				} else if (($inputsContainer.attr('data-layout') == 'impact-tags')) {
					new_item.placeholder = $inputsContainer.attr('data-placeholder');
					$newItem = $(templates.impactTagInputFactory(new_item))
					$newItem.appendTo($inputsContainer);
					// if (new_item.flag == 'color'){
					this.initColorPicker($newItem);
					// }
				} else {
					new_item.placeholder = $inputsContainer.attr('data-placeholder');
					$newItem = $(templates.multiInputFactory(new_item))
					$newItem.appendTo($inputsContainer);
					if (new_item.flag == 'color'){
						this.initColorPicker($newItem);
					}
				}
			},

			removeItem: function(e){
				var $thisInput = $(e.currentTarget).parents('li.input.multi');
				$thisInput.remove();
			},

			saveDataToServer: function(){
				var settings = this.getSettingsData();
				var valid = this.validateSettings(settings);
				console.log(settings);
				if (valid){
					console.log('valid!');
					// this.model.save(settings);
				}
			},

			getSettingsData: function(){
				var settings = {},
						$inputContainers = this.$el.find('.inputs-container');
				$inputContainers.each(function(i){
					var $this = $(this),
							key = $this.attr('data-key'),
							$inputs = $this.find('.input'),
							input_val;

					// TODO, more and better validation
					if ( !$inputs.hasClass('multi') ){
						// Only enter it if it's not empty
						input_val = $inputs.find('.input-item').val().trim();
						if ( input_val ) {
							settings[key] = input_val;
						}
					} else {
						$inputs.each(function(){
							var input_obj = {},
									val_collection = [];
							$(this).find('.input-item').each(function(){
								var $this = $(this),
								    input_key = $this.attr('data-key');

								// Get the val based on the input type it is
								var val,
										type = $this.attr('type');

								// If its a radio or checkbox, access its val with the checked property
								// Otherwise it's a text field so get its .val()
								if (type == 'radio' || type == 'checkbox'){
									val = $this.prop('checked');
								} else {
									val = $this.val();
								}

								// Cut off the fat
								if (typeof val == 'string') val = val.trim();

								if (input_key) {
									input_obj[input_key] = val;
									// If it has a uid key, add that also
									if ($this.attr('data-uid')){
										var uid = $this.attr('data-uid');
										if (uid === 'false') uid = null
										input_obj['uid'] = uid;
									}
								} else {
									input_obj = val;
								}
								val_collection.push(val);
							});

							console.log(val_collection)
							if ( !_.some(val_collection, function(d) { return _.isEmpty(d) && !_.isBoolean(d) } ) ){
								if (!settings[key]) settings[key] = [];
								settings[key].push(input_obj)
							}
						})
					}
				});
				return settings;
			},
			reportError: function(msg){
				alert(msg);
				return false;
			},
			validateSettings: function(settings){
				// Check if passwords match
				if ( settings.password) {
					if (!_.isEqual(settings.password[0],settings.password[1]) ) { this.reportError('Passwords do not match'); return false }
					else {settings.password = settings.password[0]}
				} 
				// // Return true if none of our conditions were false
				return true;
			}

		}),
		helpers: {
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
				// console.log(this.model.toJSON())
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

				this.chartSelector = '#ST-chart';

				this.formatDate = d3.time.format('%Y-%m-%d %X');
				this.legend =	{
					facebook_likes: {service: 'Facebook', metric: 'likes', color: '#3B5998', group: 'a'},
					twitter_shares: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
					pageviews: {service: '', metric: 'pageviews', color: '#fc0', group: 'b'}
				}

				this.eventsData = this.model.toJSON().events;
				this.timeseriesData = this.model.toJSON().timeseries_stats;
				var that = this;

				this.spottedTail = spottedTail()
					.x(function(d) { 
						var utc_date = that.formatDate.parse(d.datetime),
								user_timezone_date = new Date(utc_date.setHours(utc_date.getHours() + parseFloat(pageData.org.timezone) ));

						return user_timezone_date
					})
					.y(function(d) { return +d.count; })
					.legend(this.legend)
					.eventSchema(pageData.eventSchemas)
					.events(this.eventsData)
					.onBrush(this.filterEventsByDateRange);
					// .notes(notes);

				},

			render: function(){
				console.log(this.model.toJSON())
				var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_detail_markup);

				return this;
			},

			bakeInteractiveBits: function(){
				this.bakeChart();
				this.bakeEventGallery
			},

			bakeChart: function(){
				d3.select(this.chartSelector)
					.datum(this.timeseriesData)
					.call(this.spottedTail);
			},

			bakeEventGallery: function(){

			},

			filterEventsByDateRange: function(dateRange){
				console.log(dateRange)
			},

			destroy: function(){
				if (this.model.get('destroy')) this.remove();
			}

		}),
		ArticleDetailGrid: Backbone.View.extend({

			tagName: 'div',

			className: 'compare-grid-container',

			events: {
				'click .header-el': 'sortColumn'
			},

			initialize: function(){
				this.render();
				this.sortAscending = true;
			},

			render: function(){
				var grid_markup = templates.articleGridContainerMarkup;
				this.$el.html(grid_markup);

				return this;
			},

			sortColumn: function(e){
				var $this = $(e.currentTarget);
				// Styling
				$('.header-el').removeClass('active');
				$this.addClass('active');

				// Sorting
				var metric = $this.attr('data-metric');
				this.sortAscending = !this.sortAscending;
				app.instance.$isotopeCntnr.isotope({ sortBy : metric, sortAscending: this.sortAscending })
			}
		}),
		ArticleDetailRow: Backbone.View.extend({

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
						article_detail_markup = templates.articleDetailRowFactory( _.extend(model_json, templates.helpers) );

				this.$el.html(article_detail_markup);
				this.$el.attr('data-title', model_json.title)
								.attr('data-date', model_json.datetime);

				this.data = this.transformData(this.model.toJSON());

				// Add a whole bunch of quant attributes dynamically
				_.each(this.data.quant_metrics, function(bullet){
					$el.attr('data-'+bullet.metric, bullet.count);
				})
				// Add aggregate values for bars
				$el.attr('data-qual-subject-tags', this.data.qual_metrics['subject_tags'].length);

				_.each(this.data.qual_metrics['impact_tags'], function(category){
					$el.attr('data-qual-'+category.key, category.values.count);
				});
				// console.log(this.data)

				this._el = d3.select( this.el ).select('.article-detail-row-container').selectAll('.cell');
				return this;
			},

			transformData: function(modelData){
				var tag_columns = false;
				modelData.qual_metrics = d3.nest()
					.key(function(d) { return d.metric } )
					.rollup(function(list){
						// Turn each tag id into a tag object
						var tags =  list.map(function(d) {return pageData.org[d.metric].filter(function(f){ return f.uid == d.id })[0] });
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
						.attr('data-article_uid', function(d) { return d.article_uid })
						.html(function(d) { return d.title });

				// And date
				row.append('div')
						.classed('cell', true)
						.classed('date', true)
						.classed('single', true)
						.attr('data-date', function(d) { return d.datetime } )
						.html(function(d) { return templates.helpers.conciseDate(d.datetime) });

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
				var subject_bar_container = row.append('div')
					.classed('cell', true)
					.classed('bars', true)
					.classed('gfx', true)
					.append('div')
						.classed('bar-container', true)
						.attr('data-group', 'subject-tags');

				subject_bar_container.selectAll('.bar-column').data(this.data.qual_metrics['subject_tags']).enter()
					.append('div')
					.classed('bar-column', true)
					.selectAll('.bar').data(function(d) { return d }).enter()
						.append('div')
							.classed('bar', true)
							.style('background-color', function(d) { return d.color });

				// Make a container for impact bar tags 
				var impact_bar_container = row.append('div')
					.classed('cell', true)
					.classed('bars', true)
					.classed('gfx', true)
					.append('div')
						.classed('bar-container', true)
						.attr('data-group', 'impact-tags');

				var impact_bar_column = impact_bar_container.selectAll('.bar-column').data(this.data.qual_metrics['impact_tags']).enter()
					.append('div')
						.classed('bar-column', true)

				impact_bar_column.selectAll('.bar').data(function(d) { return d.values.values }).enter()
					.append('div')
						.classed('bar', true)
						.style('background-color', function(d) { return d.color });

				// Initialize isotope on this item
				cb.call(app.instance, this.$el);
			},
			updateBulletMarker: function(){



			},

			goToDetail: function(e){
				var article_uid = $(e.currentTarget).attr('data-article_uid');
				app.instance.divisionSwitcher.updateHash('single', article_uid);
			},

			close: function(){
				var behavior = app.helpers.drawer.determineBehavior();
				// Call the appropriate behavior
				routing.router.set[behavior]( this.model.get(app.instance.detailUid) );
			},

			destroy: function(){
				if (this.model.get('destroy')) {
					if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
					else this.remove();
				}
			},

			helpers: {
				calcSize: function(d, value){
					var val = d[value];

					var max = pageData.org.metric_maxes.filter(function(f) { return f.metric = d.metric })[0].max;

					var scale = d3.scale.linear()
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
				if (destroy_mode === true) {
					if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
					else this.remove();
				}
				// If it's fancier, then it means we've gone through some dis/approval and we can have more options
				if (destroy_mode == 'delete') {
					// Add styles to fade out in red or something
					if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
					else this.remove();
				} else if (destroy_mode == 'save'){
					// Fade out in green or something
					if (app.instance.$isotopeCntnr) app.instance.$isotopeCntnr.isotope( 'remove', this.$el ).isotope('layout');
					else this.remove();
				}
			}

		}),
		RecipeForm: Backbone.View.extend({
			tagName: 'div',

			className: 'article-detail-wrapper mode-content',

			events: {
				'submit form': 'save'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function() {
				var river_item_markup = templates.recipeFormFactory( _.extend(this.model.toJSON(), templates.helpers) );
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