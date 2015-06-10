app.ApprovalRiver = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .scroll-to': 'scrollTo',
		'click .load-more': 'loadMoreAlerts'
	},

	initialize: function(){

		// Keep track of views rendered by this view
		this._subviews = [];

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');

		// Update hash and active collection on mode change
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// When an alert is added or removed from the active_alerts collection, add or remove it
		this.listenTo(collections.active_alerts.instance, 'add', this.alerts.add);
		this.listenTo(collections.active_alerts.instance, 'remove', this.alerts.remove);

		// Create views for every one of the models in the collection and add them to the page
		this.render();
		// Bind scrolling here because backbone events doesn't like to do it
		// var that = this;
		// this.$content.on('scroll', function(){
		// 	var $content = $(this);
		// 	// that.lazyLoadAlerts.call(that, $content);
		// })
		// this.enableWaypoint(); 
	},

	saveHash: function(mode){
		routing.router.navigate(mode);
	},

	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');
			// Kill all subviews
			this.killAllSubviews();
			this.sectionMode[mode].call(this);
			this.saveHash(mode);

			return this;

		},

		'my-recipes': function(){

			// Stash some selectors
			var $drawer = this.$drawer,
					$drawerPointers = $drawer.find('#drawer-pointers-container'),
					$content = this.$content,
					$recipes = $('#recipes');

			$drawer.attr('data-mode', 'my-recipes');

			var has_recipes = collections.recipes.instance.length;
			// Bake recipe buttons in the drawer
			// Prep the drawer with our show all button, which is an instance of the show all view
			var show_all_view = new views.ShowAllRecipes({}),
					show_all_markup = show_all_view.render(has_recipes).el;

			// Stash this so we might destroy it on divisionSwitch
			this._subviews.push(show_all_view);
			// Set the initial state, unless we want to hold off because we have something in the hash that will load stuff
			if (!app.instance.pause_init){
				show_all_view.setState();
			}
			// Save it so we might modify the drawer-outer active state on selection of other options
			this.show_all_view = show_all_view;
			$drawerPointers.html(show_all_markup);

			// Bake the other recipes
			if (has_recipes){
				collections.recipes.instance.each(function(accountRecipeModel){
					var item_view = new views.RecipeDrawer({model: accountRecipeModel}),
							item_markup = item_view.render().el;
					this._subviews.push(item_view);

					$recipes.append(item_markup);
				}, this);
			} else {
				$content.html('<div class="placeholder">You don\'t have any recipes. Click <a href="/approval-river#create">create</a> to make some. &mdash; <em>Merlynne</em></div>');
			}

			return this;

		},

		create: function(){

			// Stash some selectors
			var $drawer = this.$drawer,
					$drawerPointers = $drawer.find('#drawer-pointers-container'),
					$content = this.$content,
					$recipes = $('#recipes');

			// Clear the load more button
			this.clearLoadMoreButton();

			// Add the pointer text
			var recipe_creator_prep_markup = templates.drawerCreatePrep;
			$drawerPointers.html(recipe_creator_prep_markup);

			// Add the table of contents of recipe schema
			collections.sous_chefs.each(function(recipeSchema){
				var item_view = new views.RecipeSchemaListItem({model: recipeSchema}),
						item_el   = item_view.render().el;
				this._subviews.push(item_view);
				$recipes.append(item_el)
			}, this);

			// Add the recipe creator forms
			collections.sous_chefs.each(function(recipeSchema){
				var item_view = new views.RecipeSchemaForm({model: recipeSchema}),
						item_el   = item_view.render().el;

				this._subviews.push(item_view);

				$content.append(item_el)
			}, this);

			return this;

		}
	},

	alerts: {
		add: function(alertModel){
			// Actions to take when adding an item to the drawer
			var item_view,
				item_el;

			item_view = new views.Alert({model: alertModel});
			item_el = item_view.render().el;

			this._subviews.push(item_view);
			this.$content.append(item_el);

			return this;
		},
		remove: function(alertModel){
			alertModel.set('destroy', 'remove');

			return this;
		}
	},

	render: function(){
		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })

		return this;
	},

	content: {

		setActiveAlertsPerRecipe: function(recipeId){

			var that = this, // `this` is `app.instance`.
					alerts_in_memory,
					page_size = collections.active_alerts.instance.metadata('page_size'),
					oldest_timestamp_in_memory;


			// Set the id of the active recipe
			collections.active_alerts.instance.metadata('recipe_id', recipeId);

			var fetch_options = {
						remove: false,
						data: { 
							include_raw: true,
							count: page_size
						}, // To be populated down below with `before` if applicable.
						processData: true,
						success: function(collection, response, options){
							// Keep track of these in the show all collection
							if (recipeId == 'all'){
								collections.loaded_alerts.main_river_instance.add(response.results);
							}
							// Clear the loading spinner
							that.$content.find('#alert-spinner').remove();
							// Call the load more button, which has its own logic on whether it should display itself and how it behaves
							that.setLoadMoreButton.call(that, response);
						},
						error: function(model, err){
							console.log('Error fetching alerts for recipe', model, err);
						}
					};

			var pending_alerts_count;
			if (recipeId != 'all'){
				alerts_in_memory = collections.loaded_alerts.instance.where({recipe_id: recipeId}); // Gets the first model that matches the recipe, which, because this collection is sorted will be the newest one
				fetch_options.data.recipe_id = recipeId;
				pending_alerts_count = collections.recipes.instance.findWhere({id: recipeId}).get('pending');
				collections.active_alerts.instance.metadata('total_pending', pending_alerts_count);
			} else {
				alerts_in_memory = collections.loaded_alerts.main_river_instance.models;
				pending_alerts_count = collections.loaded_alerts.main_river_instance.metadata('total_pending')
				collections.active_alerts.instance.metadata('total_pending', pending_alerts_count);
			}

			// Do some cleanup
			// Get rid of the load more button
			that.clearLoadMoreButton.call(this);
			// Reset their destroy mode so that we might destroy it later
			alerts_in_memory.forEach(function(alertModel){
				alertModel.set('destroy', null);
			});

			// If we don't have pending alerts, say so, otherwise, figure out how to load them either from memory, the server, or both
			if (!pending_alerts_count){
				that.$content.html('<div class="placeholder">This recipe doesn\'t have any pending alerts. I\'ll keep searching!<br/>&mdash; <em>Merlynne</em></div>');
				// Zero-out our collection
				collections.active_alerts.instance.set(alerts_in_memory);
			} else {
				that.$content.find('.placeholder').remove();
				// See if we need to offset by any existing timestamp		
				if (alerts_in_memory.length){
					oldest_timestamp_in_memory = alerts_in_memory[alerts_in_memory.length - 1].get('timestamp');
					fetch_options.data.before = oldest_timestamp_in_memory;
				}

				// See if we need to fetch at all
				var fetching = alerts_in_memory.length < page_size;
				if (fetching){
					// Set the stuff in memory
					collections.active_alerts.instance.set(alerts_in_memory);
					// Since we're fetching, set the loading gif
					that.$content.append('<div id="alert-spinner" class="loading-spinner">Loading... </div>')
					// Fetch new alerts, callbacks specified in `fetch_options`.
					collections.active_alerts.instance.fetch(fetch_options);
				} else {
					// If we're not fetching, that is to say, we have a full page already in memory, just set those models, or we dont have any
					collections.active_alerts.instance.set(alerts_in_memory);
					// Call the load more button, which has its own logic on whether it should display itself and how it behaves
					that.setLoadMoreButton.call(app.instance);
				}

			}


			return this;

		}


	},

	loadMoreAlerts: function(e){

		// Set the button to loading mode
		this.gifizeLoadMoreButton($(e.currentTarget));

		var that = app.instance, // This is `app.instance`.
				recipeId = collections.active_alerts.instance.metadata('recipe_id'),
				alerts_in_memory,
				page_size = collections.active_alerts.instance.metadata('page_size');

		var fetch_options = {
					remove: false,
					data: { 
						include_raw: true,
						count: page_size
					}, // To be populated down below with `before` if applicable.
					processData: true,
					success: function(collection, response, options){
						// Add fetched models from `all` stream to that collection so that they persist
						// This is somewhat inelegant since we handle this for other models by writing our own parse function for `active_alerts`
						// But these go into a separate collection and parse doesn't have access to that distinction so we'll do it here
						if (recipeId == 'all'){
							collections.loaded_alerts.main_river_instance.add(response.results);
						}
						// Call the load more button, which has its own logic on whether it should display itself and how it behaves
						that.setLoadMoreButton.call(that);
					},
					error: function(model, err){
						console.log('Error fetching more alerts detail', err);
					}
				};

		if (recipeId != 'all'){
			alerts_in_memory = collections.loaded_alerts.instance.where({recipe_id: recipeId}), // Gets the first model that matches the recipe, which, because this collection is sorted will be the newest one
			fetch_options.data.recipe_id = recipeId;
		} else {
			alerts_in_memory = collections.loaded_alerts.instance.models;
		}

		// Do this afterwards here because there's no clean way to set all the things that `recipeId != 'all'` needs and `fetch_options`.
		fetch_options.data.before = alerts_in_memory[alerts_in_memory.length - 1].get('timestamp') // The oldest timestamp in our collection held in memory

		// Fetch for the next page of results
		collections.active_alerts.instance.fetch(fetch_options);

		return this;
	},

	gifizeLoadMoreButton: function($loadMore){
		$loadMore.html('Loading... ').addClass('disabled').addClass('loading-spinner');
	},

	clearLoadMoreButton: function(){
		// Always kill the button
		this.$content.find('.load-more').remove();
	},
	
	setLoadMoreButton: function(){
		var number_of_active_alerts = collections.active_alerts.instance.length,
				total_pending_for_recipe_id = collections.active_alerts.instance.metadata('total_pending'),
				$loadMore,
				page_size = collections.active_alerts.instance.metadata('page_size');

		// Always kill the button
		this.clearLoadMoreButton();

		// Do we need the button
		var more_alerts_to_load = number_of_active_alerts < total_pending_for_recipe_id,
				remaining_alerts = total_pending_for_recipe_id - number_of_active_alerts,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				load_more_str;

		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMore = $('<button class="load-more"></button>');
			load_more_str = 'Showing ' + number_of_active_alerts + ' out of ' + total_pending_for_recipe_id + '. Load ' + to_load_string + ' more...'
			// Finally, append it as the last thing
			$loadMore.html(load_more_str).appendTo(this.$content);
		}

		return this;
	},

	// enableWaypoint: function(){
	// 	console.log(this.$el.find('.recipe-form-container').length)
	// 	this.$el.find('.recipe-form-container').waypoint(function(dir) {
	// 		console.log(dir)
	// 		var $this = $(this),
	// 				id = $this.find('.title').attr('id').replace('-recipe','')
	// 				idx;
	// 		$('.drawer-list-outer.scroll-to').removeClass('active');
	// 		if (dir == 'down'){
	// 			$('.drawer-list-outer.scroll-to[data-destination="'+id+'"]').addClass('active');
	// 		} else if (dir == 'up'){
	// 			idx = $('.recipe-form-container').index( $this );
	// 			$($('.drawer-list-outer.scroll-to')[idx]).addClass('active')
	// 		}
	// 	},{ context: this.$content, offset: 50 });
	// },

	scrollTo: function(e){
		var dest = $(e.currentTarget).attr('data-destination');
		this.$content.animate({
			scrollTop: (this.$content.scrollTop() + $('#'+dest+'-recipe').position().top - parseFloat(this.$content.css('padding-top')))
		}, 200);
	}

	// lazyLoadAlerts: function($content){
	// 	var that = this;
	// 	// Vars to detect if at bottom
	// 	var content_scrollHeight = $content[0].scrollHeight,
	// 			content_scrollTop = $content.scrollTop(),
	// 			content_outerHeight = $content.outerHeight(),
	// 			at_bottom = (content_scrollHeight - content_scrollTop == content_outerHeight);

	// 	// Vars to see if we need to load more
	// 	var active_alerts_count = collections.active_alerts.instance.length,
	// 			pending_alerts_count = collections.active_alerts.instance.metadata('active_recipe_id_pending'),
	// 			we_dont_have_all_the_models = active_alerts_count < pending_alerts_count;

	// 	// Vars to see if and what we should load
	// 	// All of these come from the `meta` field on `collections.active_alerts`.
	// 	var min_timestamp = collections.active_alerts.instance.metadata('min_timestamp'),
	// 			active_recipe_id = collections.active_alerts.instance.metadata('active_recipe_id');

	// 	var options = {};

	// 	console.log('lazy load check. at bottom:', at_bottom, '; we dont have all the models:', we_dont_have_all_the_models)

	// 	if (at_bottom && we_dont_have_all_the_models){
	// 		options = { 
	// 			remove: false, // Setting remove to false will ensure that the loaded models will be concatenated onto the existing models
	// 			processData: true,
	// 			data: {
	// 				before: min_timestamp,
	// 			},
	// 			success: function(collection, results, options){
	// 				console.log('lazy fetch successeful');
	// 				that.getAssociatedAlertsForRecipe.cleanupFetch(collection, results, options)
	// 			},
	// 			error: function(err){
	// 				console.log('Error fetching ' + recipe_id);
	// 			}
	// 		}
	// 		if (active_recipe_id != 'all'){
	// 			options.data.recipe_id = active_recipe_id;
	// 		}
	// 		collections.active_alerts.instance.fetch(options);

	// 	}
	// }
});