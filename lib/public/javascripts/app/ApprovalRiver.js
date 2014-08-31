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

		// Where are the river items stored?
		// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
		// this['my-recipes'] = {
		// 	detailData: pageData.alerts,
		// 	Model: models.alert.Model
		// }

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
			this.pending_total += 5; // TODO, make sure this is coming back as a number
			// this.pending_total += +recipe_view.pending; // TODO, make sure this is coming back as a number
		}, this);

		// Recipe creator names in the sidebar
		collections.recipes.schemas_instance.each(function(recipeCreator){
			// Make each visible on load
			var recipe_creator_view = new views.RecipeSchemaListItem({model: recipeCreator });
			this.$recipeCreators.append(recipe_creator_view.render().el);
		}, this); 

		// Recipe creator forms
		collections.recipes.schemas_instance.each(function(recipeCreator){
			// Make each visible on load
			var recipe_creator_form_view = new views.RecipeForm({model: recipeCreator });
			this.$content.append(recipe_creator_form_view.render().el);
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
					min_timestamp,
					destination,
					action;	

			// If it is a `viewing` article, fetch its data
			// Otherwise do nothing
			if (is_new) {
				recipe_id			= recipeModel.get(this.listId);
				pending 			= recipeModel.get('pending');
				min_timestamp = collections.all_alerts.instance.meta('timestamp');
				destination 	= this.getAssociatedAlertsForRecipe.add;
				action 				= 'add';

				this.getAssociatedAlertsForRecipe.fetch.call(this, recipe_id, action, destination, pending, min_timestamp);
			}
			return this;
		},
		fetch: function(recipe_id, action, cb, pending, minTimestamp){
			var page_limit = 5,
					options = {};

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

				if (minTimestamp) {
						options = { 
							data: { 
								before: minTimestamp,
								recipe_id: recipe_id
							},
							processData: true,
							success: function(collection, response, options){

								// Add the new stuff to our collection keeping track of everything
								collections.all_alerts.instance.add(response.results);

								// Response should be the array of matching json objects to add.
								// We combine this with `loaded_matches` to dispaly everything we have so far
								var matches_loaded_so_far = loaded_matches.concat(response.results);

								// Load these
								cb(matches_loaded_so_far);
							},
							error: function(model, response, options){
								console.log('Error fetching ' + recipe_id);
							}
						}
				}
				// Fetch with the options defined above
				// TODO, if you want, you could bind an action to fetch instead of defining functions in `options` above.
				// That depends on how reusable those functions are
				collections.all_alerts.instance.fetch(options);
			}
		},
		add: function(itemData){
			collections.active_alerts.instance.set(itemData);
			app.instance.$isotopeCntnr.isotope('layout');
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
			item_view = new views.RiverItem({model: detailModel});
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
				console.log('load all')
				// Add all of the detailData models, which is everything we've loaded, into the active collection
				// min_timestamp = this[section_mode].detailData.min_timestamp
				// collections.all_alerts.instance.meta('timestamp', min_timestamp);
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
	}
});