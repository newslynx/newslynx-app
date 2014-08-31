app.ApprovalRiver = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
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
		this.$viewAll = $('.view-all').parent();

		this.isotopeCntnr = '#river-items-container';
		this.isotopeChild = '.article-detail-wrapper';


		// What are your keys for article ids?
		// The values of these keys need to match
		// This defines the relationship between your drawer items and the detail items
		// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
		this.listId = 'id';
		this.detailId = 'recipe_id';

		// When an recipe item has `viewing` set to true
		// Fetch or find the associated river items for that recipe and add that to the `collections.active_alerts` collection
		this.listenTo(collections.recipes.instance, 'change:viewing', this.getAssociatedAlertsForRecipe.go);
		// If we turn on the `all_alerts` model, then add all the alerts in that collection to the viewing collection
		this.listenTo(models.all_alerts.instance, 'change:viewing', this.river.loadAllAlerts);

		// Listen to whether we're in view-all mode or not
		this.listenTo(this.model, 'change:view-all', this.updateViewAll);

		// Detailed data fetched by `article.set.go` is then either added or removed from a collection
		// Correspondingly the dom elements are baked or destroyed
		this.listenTo(collections.active_alerts.instance, 'add', this.river.bake);
		this.listenTo(collections.active_alerts.instance, 'remove', this.river.destroy);

		// Create views for every one of the models in the collection and add them to the page
		this.bake();
		// Bind scrolling here because backone events doesn't like to do it
		this.$content.on('scroll', this.lazyLoadAlerts)
		// this.enableWaypoint(); 
	},

	updateViewAll: function(){
		var viewing_all = this.model.get('view-all'),
				selected_recipes;

		if (viewing_all){ 
			models.all_alerts.instance.set('viewing', true);
			// If we're going into view all mode, set this to false
			// But don't remove the items from the collection
			selected_recipes = collections.recipes.instance.where({'viewing': true});
			if (selected_recipes.length) {
				collections.recipes.instance.where({'viewing': true})[0].set('viewing', false);
			}
		} else {
			models.all_alerts.instance.set('viewing', false);
		}
	}, 

	bake: function(){
		// Recipe list
		collections.recipes.instance.each(function(recipe){
			// Make each visible on load
			var recipe_view = new views.Recipe({model: recipe});
			this.$recipes.append(recipe_view.render().el);
			// Add up the total of all alerts for each recipe
			this.all_pending_alerts_count += recipe.get('pending'); // TODO, make sure this is coming back as a number
		}, this);

		// Recipe creator names in the sidebar
		collections.recipes.schemas_instance.each(function(recipeCreator){
			// Make each visible on load
			var recipe_creator_view = new views.RecipeSchemaListItem({model: recipeCreator });
			this.$recipeCreators.append(recipe_creator_view.render().el);
		}, this); 

		// Recipe creator forms
		collections.recipes.schemas_instance.each(function(recipeSchema){
			// Make each visible on load
			var recipe_schema_form_view = new views.RecipeSchemaForm({model: recipeSchema });
			this.$content.append(recipe_schema_form_view.render().el);
		}, this);

		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })
		new views.LoadAllDrawerItems({ model: models.all_alerts.instance, el: this.$viewAll })
		app.helpers.isotope.initCntnr.call(this);
		// On layout complete sort by timestamp
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
	},

	getAssociatedAlertsForRecipe: {
		go: function(recipeModel){
			var is_new = recipeModel.get('viewing'),
					recipe_id,				
					pending,	
					min_timestamp;

			// If it is a `viewing` article, fetch its data
			// Otherwise do nothing
			if (is_new) {
				recipe_id			= recipeModel.get(this.listId);
				pending 			= recipeModel.get('pending');
				min_timestamp = collections.all_alerts.instance.metadata('timestamp');

				this.getAssociatedAlertsForRecipe.fetch.call(this, recipe_id, pending, min_timestamp);
			}
			return this;
		},
		fetch: function(recipe_id, pending, minTimestamp){
			var page_limit = 5,
					options = {},
					that = this;

			// If this id already has a detailed Json object loaded, then return that
			// If not, then fetch it from the server
			var mode = models.section_mode.get('mode');
			var loaded_matches = collections.all_alerts.instance.filterAlerts(app.instance.detailId, recipe_id);

			// Only proceed with loading the ones in memory if you have loaded matches but you're not in `my-recipes` mode // not sure why this exists
			// Or if you are in `my-recipes mode, then only proceed if the total number pending is how many you have
			// console.log(loaded_matches.length, 'out of' , pending)
			if ((loaded_matches.length && mode != 'my-recipes') || (mode == 'my-recipes' && (loaded_matches.length >= page_limit || loaded_matches.length == pending))) {
				cb.call(this, loaded_matches);
				// Reload layout via hack
				app.helpers.isotope.relayout();
			} else {

				options = { 
					processData: true,
					data: { 
						before: minTimestamp,
						recipe_id: recipe_id
					},
					success: function(collection, response, options){
						that.getAssociatedAlertsForRecipe.cleanupFetch(collection, response, options, pending);
					},
					error: function(err){
						console.log('Error fetching ' + recipe_id);
					}
				}
				// Fetch with the options defined above
				// TODO, if you want, you could bind an action to fetch instead of defining functions in `options` above.
				// That depends on how reusable those functions are
				collections.active_alerts.instance.fetch(options);
			}
		},
		cleanUp: function(itemData, recipe_id){
			// Set the colleciton models to the newly fetched data
			// collections.active_alerts.instance.set(itemData); // I think this is already being done in the fetch now
			// And describe the current active set
		},
		cleanupFetch: function(collection, results, options, pending){
			collections.active_alerts.instance.metadata('active_recipe_id', options.data.recipe_id);
			collections.active_alerts.instance.metadata('active_recipe_id_pending', pending);
			app.instance.$isotopeCntnr.isotope('layout');

			// Load these
			// this.getAssociatedAlertsForRecipe.cleanUp(matches_loaded_so_far, options.data.recipe_id);
		}
	},

	divisionSwitcher: {
		updateHash: function(entering_mode){
			// At this point, the mode has been changed but the hash has not
			var exiting_hash = window.location.hash,
					exiting_mode = routing.helpers.getMode(exiting_hash),
					exiting_ids = routing.helpers.getArticleIds(exiting_hash),
					previous_ids = models.section_mode.get('previous-ids') || '';

			var entering_hash = entering_mode;

			if (exiting_mode == 'my-recipes' && exiting_ids){
				models.section_mode.set('previous-ids', exiting_ids)
			} else if (exiting_mode == 'create-new' && previous_ids){
				entering_hash += '/' + previous_ids;
			}

			routing.router.navigate(entering_hash, {trigger: true});
		}
	},
	river: {
		bake: function(detailModel){
			var mode = models.section_mode.get('mode'),
					id = detailModel.get('id'),
					item_view,
					item_el;

			// On bake, set destroy to false so that we might destroy it later
			// This could be refactored to setting `viewing` to different values so that it is always changing. Or, on viewing to true, set destroy to false, instead of doing that here in the view. Or mayb
			detailModel.set('destroy', false);
			item_view = new views.Alert({model: detailModel});
			item_el = item_view.render().el;
			this.$listContainer.append(item_el);
			app.helpers.isotope.addItem.call(app.instance, item_el);

			return this;
		},
		destroy: function(detailModel){
			var viewing_all = app.instance.model.get('viewing_all');
			if (!viewing_all) {
				detailModel.set('destroy', 'delete');
			}
		},

		loadAllAlerts: function(loadAllModel){
			var load_all = loadAllModel.get('viewing'),
					section_mode,
					min_timestamp;

			if (load_all){
				// All of the meta data is stored on `active_alerts`
				// The two pieces of metadata to store are the active `recipe_id` and the current `min_timestamp`
				min_timestamp = collections.all_alerts.instance.metadata('timestamp', min_timestamp);
				collections.active_alerts.instance.metadata('min_timestamp', min_timestamp);
				collections.active_alerts.instance.metadata('active_recipe_id', 'all');
				collections.active_alerts.instance.metadata('active_recipe_id_pending', this.all_pending_alerts_count);

				// Set models to everything we got
				collections.active_alerts.instance.set(collections.all_alerts.instance.models); 
				app.helpers.isotope.relayout();

			}
		},
		loadMoreAlerts: function(){
			// TODO
			/* 
				if length in collection is less than total, load another page.
			*/

		}
	},
	lazyLoadAlerts: function(){
		// Vars to detect if at bottom
		var $content = $(this),
				content_scrollHeight = $content[0].scrollHeight,
				content_scrollTop = $content.scrollTop(),
				content_outerHeight = $content.outerHeight(),
				at_bottom = (content_scrollHeight - content_scrollTop == content_outerHeight);

		// Vars to see if we need to load more
		var active_alerts_count = collections.active_alerts.instance.length,
				pending_alerts_count = collections.active_alerts.instance.metadata('active_recipe_id_pending'),
				we_dont_have_all_the_models = active_alerts_count < pending_alerts_count;

		// Vars to see if and what we should load
		// All of these come from the `meta` field on `collections.active_alerts`.
		var min_timestamp = collections.active_alerts.instance.metadata('min_timestamp'),
				active_recipe_id = collections.active_alerts.instance.metadata('active_recipe_id');

		var options = {};

		if (at_bottom && we_dont_have_all_the_models){
			options = { 
				remove: false, // Setting remove to false will ensure that the loaded models will be concatenated onto the existing models
				processData: true,
				data: {
					before: minTimestamp,
				},
				success: function(collection, results, options){
					that.getAssociatedAlertsForRecipe.handleFetch(collection, results, options)
				},
				error: function(err){
					console.log('Error fetching ' + recipe_id);
				}
			}
			if (active_recipe_id != 'all'){
				options.data.recipe_id = active_recipe_id
			}
			collections.active_alerts.instance.fetch(options);

		}
	}
});