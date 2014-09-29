app.ApprovalRiver = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .scroll-to': 'scrollTo',
		'click .load-more': 'moreAlerts'
	},

	initialize: function(){

		// Keep track of views rendered by this view
		this._subviews = [];

		// Cache these selectors
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');
		// this.$listContainer = $('#river-items-container');
		// this.$recipes = $('#recipes');
		// this.$recipeCreators = $('#recipe-creators');
		// this.$viewAll = $('.view-all').parent();

		// this.isotopeCntnr = '#river-items-container';
		// this.isotopeChild = '.article-detail-wrapper';

		// Update hash and active collection on mode change
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// this.accountRecipes = pageData.accountRecipes;

		// Listen to changes in the PourOver collection query modificaition and `set` `collections.alerts.instance` to the results of the associated view
		// Firing add and remove events on those models
		views.po.alerts.on('update', this.content.setActiveAlerts);
		// Listen for paging on the view, will will add items to the drawer, not `set` them
		views.po.alerts.on('addMoreAlerts', this.content.addActiveAlerts);

		// When an alert is added or removed from the active_alerts collection, add or remove it
		this.listenTo(collections.active_alerts.instance, 'add', this.alerts.add);
		this.listenTo(collections.active_alerts.instance, 'remove', this.alerts.remove);

		// Create views for every one of the models in the collection and add them to the page
		this.render();
		// Bind scrolling here because backone events doesn't like to do it
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

			var has_recipes = collections.recipes.account_instance.length;
			// Bake recipe buttons in the drawer
			// Prep the drawer with our show all button, which is an instance of the show all view
			var show_all_view = new views.ShowAllRecipes({}),
					show_all_markup = show_all_view.render(has_recipes).el;

			// Stash this so we might destroy it on divisionSwitch
			this._subviews.push(show_all_view);
			// Save it so we might modify the drawer-outer active state on selection of other options
			this.show_all_view = show_all_view;
			$drawerPointers.html(show_all_markup);

			// Bake the other alerts
			if (has_recipes){
				collections.recipes.account_instance.each(function(accountRecipeModel){
					var item_view = new views.RecipeDrawer({model: accountRecipeModel}),
							item_markup = item_view.render().el;
					this._subviews.push(item_view);

					$recipes.append(item_markup);
				}, this);
			}

			// Init the load more button
			app.instance.setLoadMoreButton.call(app.instance);

			return this;

		},

		create: function(){

			// Stash some selectors
			var $drawer = this.$drawer,
					$drawerPointers = $drawer.find('#drawer-pointers-container'),
					$content = this.$content,
					$recipes = $('#recipes');

			// Add the pointer text
			var recipe_creator_prep_markup = templates.drawerCreatePrep;
			$drawerPointers.html(recipe_creator_prep_markup);

			// Add the table of contents of recipe schema
			collections.recipes.schemas_instance.each(function(recipeSchema){
				var item_view = new views.RecipeSchemaListItem({model: recipeSchema}),
						item_el   = item_view.render().el;
				this._subviews.push(item_view);
				$recipes.append(item_el)
			}, this);

			// Add the recipe creator forms
			collections.recipes.schemas_instance.each(function(recipeSchema){
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

		setActiveAlerts: function(){
			console.log('setting')
			var current_filtered_set = views.po.alerts.getCurrentItems();
			app.instance.setLoadMoreButton.call(app.instance);
			// To maintain the correct sort order on the dom, we want to empty it
			collections.active_alerts.instance.set([]);
			// // For changing the drawer list items based on filters
			collections.active_alerts.instance.set(current_filtered_set);

			return this;

		},

		addActiveAlerts: function(){

			var current_filtered_set = views.po.alerts.getCurrentItems();
			app.instance.setLoadMoreButton.call(app.instance);
			// For changing the drawer list items based on filters
			collections.active_alerts.instance.add(current_filtered_set);

			return this;

		}
	},

	setLoadMoreButton: function(){
		var po = views.po.alerts,
				total_length = collections.po.alerts.items.length,
				match_set_length = po.match_set.cids.length,
				page_size = po.page_size,
				$loadMore = this.$drawer.find('.load-more');

		// If this value is postive, we have some things to display
		var diff = match_set_length - page_size;
		console.log(this.$drawer.find('.load-more'))
		// console.log(match_set_length, page_size, diff)

		if (diff > 0) {
			$loadMore.html('Showing ' + page_size + ' of ' + match_set_length + ' alerts. Load more...').parent().removeClass('disabled').prop('disabled', false)
		} else if (page_size >= total_length){
			$loadMore.html('Loaded all ' + total_length +  ' alerts.').parent().addClass('disabled').prop('disabled', true)
		} else {
			$loadMore.html('Showing ' + match_set_length +  ' matching alerts.').parent().addClass('disabled').prop('disabled', true)
		}

		return this;
	},

	moreAlerts: function(){
		console.log('more alerts')
		var current_page_size = views.po.alerts.page_size;
		views.po.alerts.page_size = current_page_size + 25;
		views.po.alerts.trigger('addMoreAlerts');

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