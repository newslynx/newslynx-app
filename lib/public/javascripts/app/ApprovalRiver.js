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
		this.drawerData = pageData.accountRecipes;
		this['my-recipes'] = {
			detailData: pageData.riverItems,
			Model: models.river_item.Model
		}

		// What are your keys for article ids?
		// The values of these keys need to match
		// This defines the relationship between your drawer items and the detail items
		// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
		this.listId = 'id';
		this.detailId = 'recipe_id';

		// When an recipe item has `viewing` set to true
		// Fetch or find the associated river items for that recipe and add that to the `collections.detail_items` collection
		this.listenTo(collections.drawer_items.instance, 'change:viewing', app.helpers.itemDetail.go);
		// this.listenTo(collections.drawer_items.instance, 'change:viewing', this.river.resetViewAllBtn);
		this.listenTo(models.drawer_item_all.instance, 'change:viewing', this.river.loadAllAlerts);

		// Listen to whether we're in view-all mode or not
		this.listenTo(this.model, 'change:view-all', this.updateViewAll);


		// Detailed data fetched by `article.set.go` is then either added or removed from a collection
		// Correspondingly the dom elements are baked or destroyed
		this.listenTo(collections.detail_items.instance, 'add', this.river.bake);
		this.listenTo(collections.detail_items.instance, 'remove', this.river.destroy);

		// Create views for every one of the models in the collection and add them to the page
		this.bake();
		// this.enableWaypoint(); 
	},

	updateViewAll: function(){
		var viewing_all = this.model.get('view-all'),
				active_drawer_items;
		if (viewing_all){ 
			models.drawer_item_all.instance.set('viewing', true);
			// If we're going into view all mode, set this to false
			// But don't remove the items from the collection
			active_drawer_items = collections.drawer_items.instance.getTrue('viewing')
			if (active_drawer_items.length) {
				collections.drawer_items.instance.getTrue('viewing')[0].set('viewing', false);
			}
		} else {
			models.drawer_item_all.instance.set('viewing', false);
		}
	}, 

	bake: function(){
		// Recipe list
		collections.drawer_items.instance.each(function(recipe){
			// Make each visible on load
			var recipe_view = new views.DrawerListItem({model: recipe});
			this.$recipes.append(recipe_view.render().el);
			// Add up the total of all alerts for each recipe
			this.pending_total += 5; // TODO, make sure this is coming back as a number
			// this.pending_total += +recipe_view.pending; // TODO, make sure this is coming back as a number
			// This model will listen for changes on the load all item to set its active state
			// recipe.listenTo(models.drawer_item_all.instance, 'change:viewing', recipe_view.updateViewingRadio)
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

		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })
		new views.LoadAllDrawerItems({ model: models.drawer_item_all.instance, el: this.$viewAll })
		app.helpers.isotope.initCntnr.call(this);
		// On layout complete sort by timestamp
		var that = this;
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

			item_view = new views.RiverItem({model: detailModel});
			item_el = item_view.render().el;
			this.$listContainer.append(item_el);
			app.helpers.isotope.addItem.call(app.instance, item_el);

			return this;
		},
		destroy: function(detailModel){
			var viewing_all = this.model.get('viewing_all');
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
				// This will fire an add event for each of them
				section_mode = models.section_mode.get('mode'); // This should be `my-recipes`. Grab it from the mode instead of the string in case we change that name later
				// min_timestamp = this[section_mode].detailData.min_timestamp
				// collections.detail_items.instance.meta('timestamp', min_timestamp);
				collections.detail_items.instance.set(collections.all_detail_items.instance.toJSON()); 
				// collections.detail_items.instance.add(this[section_mode].detailData.alerts); 
				// collections.detail_items.instance.add(this[section_mode].detailData); 
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