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

		this.setLoading(this.$content, 'true');

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

	setLoading: function($target, state){
		$target.attr('data-loading', state);
	},

	saveHash: function(mode){
		routing.router.navigate(mode);
	},

	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');
			// Set loading state
			this.setLoading(this.$drawer, 'true');
			// Clear the active alerts so that when we switch back they are re-added
			collections.active_alerts.instance.reset(null);
			// Kill all subviews
			this.killAllSubviews();
			this.$content.find('.placeholder').remove();
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

			// Bake recipe buttons in the drawer
			// Prep the drawer with our show all button, which is an instance of the show all view
			var has_recipes = collections.recipes.instance.length > 1;
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

			// Bake the manual recipe
			var manual_recipe_model = collections.recipes.instance.findWhere({id: -1});
			var manual_recipe_view = new views.RecipeDrawerStatic({model: manual_recipe_model}),
					manual_recipe_markup = manual_recipe_view.render().el;
			this._subviews.push(manual_recipe_view);
			$recipes.append(manual_recipe_markup);

			// Bake the other recipes
			if (has_recipes){
				collections.recipes.instance.each(function(recipeModel){
					// Skip over our manual-event recipe
					// We do this because we still want it in our collection so it's findable like the others with `collection.findWhere(id)`
					if (recipeModel.id !== -1){
						var item_view = new views.RecipeDrawer({model: recipeModel}),
								item_markup = item_view.render().el;
						this._subviews.push(item_view);

						$recipes.append(item_markup);
					}
				}, this);
			} else {
				$content.html('<div class="placeholder">You don\'t have any recipes. Click <a href="/approval-river#create">create</a> to make some. &mdash; <em>Merlynne</em></div>');
			}

			this.setLoading(this.$drawer, 'false');

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
			collections.sous_chefs.instance.each(function(sousChefSchema){
				var item_view = new views.SousChefDrawerItem({model: sousChefSchema}),
						item_el   = item_view.render().el;
				this._subviews.push(item_view);
				$recipes.append(item_el)
			}, this);

			// Add the recipe creator forms
			collections.sous_chefs.instance.each(function(sousChef){
				var item_view = new views.SousChefForm({model: sousChef}),
						item_el   = item_view.render().el;

				this._subviews.push(item_view);

				$content.append(item_el)
			}, this);

			this.setLoading(this.$content, 'false');

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

			this.setLoading(this.$content, 'false');
			this._subviews.push(item_view);
			this.$content.append(item_el);

			return this;
		},
		remove: function(alertModel){
			alertModel.set('destroy', 'remove');
			// this.setLoading(this.$content, 'false');

			return this;
		}
	},

	render: function(){
		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })

		return this;
	},

	content: {

		setActiveAlertsPerRecipe: function(recipeId){

			// Do some cleanup
			// Get rid of the load more button
			this.clearLoadMoreButton.call(this);

			// Add the loading state, some Merlynne potions
			this.setLoading(this.$content, 'true');

			var that = this, // `this` is `app.instance`.
					page_size = collections.active_alerts.instance.metadata('page_size');

			// Stash this here so our load more button can know what it's doing
			// The more pure way would be to have that button be part of a view on that collection, but we don't currently have such a view set up
			// And this is easy enough
			collections.active_alerts.instance.metadata('recipe_id', recipeId);

			// If a collection for this recipe doesn't exist, then create it
			if (!collections.loaded_alerts['recipe_'+recipeId+'_instance']){
				collections.loaded_alerts['recipe_'+recipeId+'_instance'] = new collections.loaded_alerts.Collection([]);
			}

			var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
			var pagination_info = loaded_alerts_collection.metadata('pagination');

			var fetch_options = {
				remove: false,
				data: {}, 
				success: function(collection, response, options){
					// Add all of this collections models into the DOM
					collections.active_alerts.instance.set(collection.models);

					// Call the load more button, which has its own logic on whether it should display itself and how it behaves
					that.setLoadMoreButton.call(that, recipeId);
				},
				error: function(model, err){
					console.log('Error fetching alerts for recipe', model, err);
				}
			};

			var provenance;
			if (recipeId != 'all'){
				if (recipeId === -1){
					provenance = 'manual';
				} else {
					provenance = 'recipe';
					fetch_options.data.recipe_ids = recipeId;
				}
				// If it's not all, we need to query with a recipe id
				fetch_options.data.provenance = provenance;
			}

			// If we've fetched this already, then it will stored, otherwise, go and look on the recipe
			// Add this logic to protect against the count being `0`.
			var recipe_alerts_pending_count = loaded_alerts_collection.metadata('total'),
					recipe_alerts_counts;
			if (!recipe_alerts_pending_count && recipe_alerts_pending_count !== 0){
				recipe_alerts_counts = collections.recipes.instance.findWhere({id: recipeId}).get('event_counts');
				if (recipe_alerts_counts){
					recipe_alerts_pending_count = recipe_alerts_counts.pending;
				} else {
					recipe_alerts_pending_count = 0;
				}
			}

			// Do we have alerts in memory
			var alert_models_in_memory = loaded_alerts_collection.models;
			// Reset their destroy mode so that we might destroy it later
			alert_models_in_memory.forEach(function(alertModel){
				alertModel.set('destroy', null);
			});

			// If we don't have pending alerts, say so, otherwise, figure out how to load them either from memory, the server, or both
			if (!recipe_alerts_pending_count){
				that.$content.html('<div class="placeholder">This recipe doesn\'t have any pending alerts. I\'ll let you know here when I find some!<br/>&mdash; <em>Merlynne</em></div>');
				// Zero-out our collection
				collections.active_alerts.instance.set(alert_models_in_memory);
				this.setLoading(this.$content, 'false');
				// If we have no models in memory, fetch the first page
			} else if (!alert_models_in_memory.length){
				// Clear the placeholder, if it exists
				that.$content.find('.placeholder').remove();
				// Clear the active collection
				collections.active_alerts.instance.set([]);
				// Fetch new alerts, callbacks specified in `fetch_options`.
				loaded_alerts_collection.fetch(fetch_options);
			}else {
				// Clear the placeholder, if it exists
				that.$content.find('.placeholder').remove();
				// If we're not fetching, that is to say, we have a full page already in memory, just set those models
				collections.active_alerts.instance.set(alert_models_in_memory);
				// Call the load more button, which has its own logic on whether it should display itself and how it behaves
				that.setLoadMoreButton.call(app.instance, recipeId);
			}

			return this;

		}


	},

	loadMoreAlerts: function(e){

		// Set the button to loading mode
		app.helpers.gifizeLoadMoreButton($(e.currentTarget));

		var that = app.instance, // This is `app.instance`.
				recipeId = collections.active_alerts.instance.metadata('recipe_id');


		var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
		var pagination_info = loaded_alerts_collection.metadata('pagination');

		var current_page = pagination_info.page;

		var fetch_options = {
			remove: false,
			data: { 
				page: current_page + 1
			},
			success: function(collection, response, options){
				// Add them to the dom
				collections.active_alerts.instance.add(response.events);
				// Call the load more button, which has its own logic on whether it should display itself and how it behaves
				that.setLoadMoreButton.call(that, recipeId);
			},
			error: function(model, err){
				console.log('Error fetching more alerts detail', err);
			}
		};

		var provenance;
		if (recipeId != 'all'){
			if (recipeId === -1){
				provenance = 'manual';
			} else {
				provenance = 'recipe';
				// If it's not all, we need to query with a recipe id
				fetch_options.data.recipe_ids = recipeId;
			}
			fetch_options.data.provenance = provenance;
		}

		// Fetch for the next page of results
		loaded_alerts_collection.fetch(fetch_options);

		return this;
	},

	clearLoadMoreButton: function(){
		this.$content.find('.load-more').remove();
	},
	
	setLoadMoreButton: function(recipeId){

		// To be created and appended below, if we need it.
		var $loadMore;

		// Always kill the button
		this.clearLoadMoreButton();

		var loaded_alerts_collection = collections.loaded_alerts['recipe_'+recipeId+'_instance'];
		var pagination_info = loaded_alerts_collection.metadata('pagination');

		var current_page = pagination_info.page,
				page_size = pagination_info.per_page,
				total_pages = pagination_info.total_pages;

		var currently_loaded_count = loaded_alerts_collection.length,
				total_pending_for_recipe_id = loaded_alerts_collection.metadata('total');

		// Do we need the button
		var more_alerts_to_load = current_page < total_pages,
				remaining_alerts = total_pending_for_recipe_id - currently_loaded_count,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				load_more_str;

		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMore = $('<button class="load-more"></button>');
			load_more_str = 'Showing ' + currently_loaded_count + ' out of ' + total_pending_for_recipe_id + '. Load ' + to_load_string + ' more...'
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
		var dest = $(e.currentTarget).attr('data-destination'),
				buffer = 10;
		this.$content.animate({
			scrollTop: (this.$content.scrollTop() + $('#'+dest+'-recipe').position().top - parseFloat(this.$content.css('padding-top')) - buffer)
		}, 200);
	}

});