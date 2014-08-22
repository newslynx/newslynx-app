app.ApprovalRiver = Backbone.View.extend({

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
		// this.listenTo(models.section_mode, 'change:mode', this.divisionSwitcher.updateHash);

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
		// this.enableWaypoint(); 
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

		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })
		app.helpers.isotope.initCntnr.call(this);

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

	resetFull: function(e){
		routing.router.navigate(models.section_mode.get('mode')+'/all', {trigger: true});
		// routing.router.navigate(models.section_mode.get('mode')+'/'+app.helpers.drawer.getAllUids.call(app.instance), {trigger: true});
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
					previous_uids = models.section_mode.get('previous-uids') || 'all';

			var entering_hash = entering_mode;

			if (exiting_mode == 'my-recipes' && exiting_uids){
				models.section_mode.set('previous-uids', exiting_uids)
			} else if (exiting_mode == 'create-new' && previous_uids){
				entering_hash += '/' + previous_uids;
			}

			routing.router.navigate(entering_hash, {trigger: true});
		}
	},
	river: {
		bake: function(detailModel){
			var mode = models.section_mode.get('mode'),
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
});