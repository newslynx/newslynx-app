app.Articles = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .add-to-comparison': 'addToComparison',
		'click .option-title .show-hide': 'showHideList'
	},

	initialize: function(){

		// Cache these selectors
		this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
		this.$impactTagCategoriesList = $('.option-container[data-type="impact-tag-categories"] .tag-list');
		this.$impactTagLevelsList = $('.option-container[data-type="impact-tag-levels"] .tag-list');
		this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
		this.$articleList = $('#article-list');
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');
		this.$drawerPointersCntnr = $('#drawer-pointers-container');


		this.isotopeCntnr = '.rows';
		this.isotopeChild = '.article-detail-row-wrapper';


		// What are your keys for article ids?
		// The values of these keys need to match, but not necessarily the keys themselves
		// The system is setup so these keys can be different, but they still point to the same unique identifier
		// This defines the relationship between your drawer items and the detail items
		// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
		this.listId = 'id'; // The key on thes summary object that points to the main article id
		this.detailId = 'article_id'; // The key on thes detail object that points to the main article id

		// Update hash and active collection on mode change
		// this.listenTo(models.section_mode, 'change:mode', this.divisionSwitcher.updateCollection);
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// Listen for changes across collection of drawer items 
		// article selection and update the drawer with appropriate article summaries
		// These are all in separate collections 1) because that's how we loaded them separated them
		// And so that we can grab the collection information as its filter group
		this.listenTo(collections.subject_tags.instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.impact_tags.instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.tag_attribute.categories_instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.tag_attribute.levels_instance, 'change:active', this.drawer.filter);

		// Listen to changes in the PourOver view and `set` `collections.article_summaries_instance` to the results of that view
		// Firing add and remove events on those models
		views.po.article_summaries.on('update', this.drawer.setActiveArticleSummaries);

		// Listen for adds and removes to the article summaries collection
		// And populate the drawer on `add` and `remove`
		this.listenTo(collections.article_summaries.instance, 'add', this.drawer.add);
		this.listenTo(collections.article_summaries.instance, 'remove', this.drawer.remove);


		// As you move things in and out of the comparison view
		// Listen to its collection and `add` and `remove things accordingly
		this.listenTo(collections.article_comparisons.instance, 'add', this.comparison.add);
		this.listenTo(collections.article_comparisons.instance, 'remove', this.comparison.remove);

		// When an item is added or removed from the detail collection, add or remove it
		// The remove is somewhat unnecessary since `this.$content`'s html is emptied. But it's consistent with our other code.
		this.listenTo(collections.article_detailed.instance, 'add', this.detail.add);
		this.listenTo(collections.article_detailed.instance, 'remove', this.detail.remove);

		// Create views for every one of the models in the collection and add them to the page
		this.bake();
	},

	bake: function(){

		this.$drawerPointersCntnr.append(templates.drawerPointers);

		// Article tags
		collections.subject_tags.instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$subjectTagList.append(tag_view.render().el);
		}, this);

		// Impact tag categories
		collections.tag_attribute.categories_instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$impactTagCategoriesList.append(tag_view.render().el);
		}, this);
		// Impact tag levels
		collections.tag_attribute.levels_instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$impactTagLevelsList.append(tag_view.render().el);
		}, this);

		// Impact tags
		collections.impact_tags.instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$impactTagList.append(tag_view.render().el);
		}, this);

		// Article Summaries in the drawer
		collections.article_summaries.instance.each(function(article){
			var article_view = new views.ArticleSummaryDrawer({model: article});
			this.$articleList.append(article_view.render().el);
		}, this);

		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher });

		return this;
	},
	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');
			this.sectionMode[mode].call(this, model, mode);

			return this;
		},
		compare: function(model, mode){
			// Prep the DOM by adding the compare grid markup
			var article_grid =  new views.ArticleComparisonGrid;
			this.$content.html( article_grid.render().el );
			this.$listContainer = $('#compare-grid .rows');
			// Init isotope on the `$listContainer`
			app.helpers.isotope.initCntnr.call(this);



			// TODO, maybe put these || conditions as defaults set on the app view
			var sort_by = collections.article_comparisons.instance.metadata('sort_by') || 'timestamp',
					sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending') || true;
			$('.header-el').attr('data-sort-ascending', sort_ascending);

			// Set the compare view to the default set of models
			// On load this will be json, but if we're coming from the detail view, we'll already have things so let's load those
			var compare_models = collections.article_comparisons.instance.models;

			// If we don't have any already in our comparison, then grab what's selected in the drawer
			// Note, this condition will most likely be on load so the `selected: true` is a bit meaningless
			// Since those models load with `selected: true`
			// But it could also trigger if you just deleted everything from the compare grid
			// In that case, grabbing just the selected ones is a better choice since it seems closer so the user's intention
			// But also it avoids loading a TON of models accidentally.
			if (!compare_models.length){
				// If we don't have anything incoming in the hash, then grab what's in the drawer as we discussed before
				// TODO, also look in the hash if we're coming from a permalink
				compare_models = collections.article_summaries.instance.where({selected: true});
				// Make sure these models get sorted in the proper way that our collection is sorted
				// You would think that adding them to our sorted collection would take care of this
				// but the sort doesn't change the order in which add events are fired, which is how we're adding things
				// Perhaps isotope layout could be called again to take care of that... For now, this works and it keeps our data sorted and clean
				if (sort_by){
					compare_models = _.sortBy(compare_models, function(compare_model){ return compare_model.get(sort_by) });
					if (sort_ascending === false) {
						compare_models.reverse();
					}
				}
			}
			collections.article_comparisons.instance.reset();
			collections.article_comparisons.instance.set(compare_models);
			this.saveHash();

			return this;
		},
		detail: function(){
			var that = this;
			// Prep the DOM by removing the comparison grid
			// TODO, put a loading gif in here
			this.$content.html('');
			// Figure out which model we are loading and add it to collections.article_detailed.instance
			this.detail.loadModel(function(model) {
				// Clear each time
				collections.article_detailed.instance.reset();
				collections.article_detailed.instance.set(model);

				that.saveHash();
			})

		}
	},
	divisionSwitcher: {
		updateCollection: function(){
			// Remove all models in the collection, firing the remove event for each one
			// This as the effect of clearing their detail markup
			// collections.detail_items.instance.remove( collections.detail_items.instance.models );
			return this;
		}

	},

	drawer: {
		filter: function(tagModel, isActive){
			var filter = tagModel.collection.metadata('filter'),
					query_value = tagModel.get('id') || tagModel.get('name').toLowerCase(); // For tags this is the id, but for tag attributes it's the name

			// If it's active set the query to the value of this tag
			if (isActive){
				// If that filter already has a condition, then chain its match set with `and`
				collections.po.article_summaries.filters[filter].intersectQuery(query_value);
			} else {
				// If it's not active then clear the query from the PourOver match set.
				collections.po.article_summaries.filters[filter].removeSingleQuery(query_value);
			}
			return this;
		},
		setActiveArticleSummaries: function(){
			var current_filtered_set = views.po.article_summaries.getCurrentItems();
			// For changing the drawer list items based on filters
			collections.article_summaries.instance.set(current_filtered_set);
		},
		add: function(summaryModel){
			// Actions to take when adding an item to the drawer
			var item_view,
				item_el;

			// On bake, set destroy to false so that we might destroy it later
			// This could be refactored to setting `viewing` to different values so that it is always changing. Or, on viewing to true, set destroy to false, instead of doing that here in the view and having to pass in silent true, which isn't very good.
			// if (summaryModel.set('destroy') === false) { summaryModel.set({'destroy': false}, {silent: true}); }			
			item_view = new views.ArticleSummaryDrawer({model: summaryModel});
			item_el = item_view.render().el;
			this.$articleList.append(item_el);

			return this;
		},
		remove: function(summaryModel){
			// Actions to take when removing an item from the drawer
			summaryModel.set('in_drawer', false);
			return this;
		}
	},
	addToComparison: function(e){
		var $btn = $(e.currentTarget),
				action = $btn.attr('data-action'),
				sort_by,
				sort_ascending;

		var selected_models = collections.article_summaries.instance.where({selected: true}),
				action;

		if (action == 'replace'){
			action = 'set';
		} else if (action == 'add'){
			action = 'add';
		}

		collections.article_comparisons.instance[action](selected_models);

		// Grab our params to sort from metadata elements on our collection
		sort_by = collections.article_comparisons.instance.metadata('sort_by')
		sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending')
		app.helpers.isotope.relayout(sort_by, sort_ascending);
		this.saveHash();

	},

	comparison: {
		add: function(summaryModel) {
			// Actions to take when adding an item to the comparison grid
			var item_view,
				item_el;

			item_view = new views.ArticleSummaryRow({model: summaryModel});
			item_el = item_view.render().el;
			this.$listContainer.append(item_el);
			app.helpers.isotope.addItem.call(app.instance, item_el);
			return this;
		},
		remove: function(comparisonModel) {
			comparisonModel.set('destroy', 'delete');
			return this;
		}
	},

	detail: {
		add: function(detailModel) {
			// Actions to take when adding an item to the detail view
			item_view = new views.ArticleDetail({model: detailModel});
			item_el = item_view.render().el;
			this.$content.html(item_el);
			return this;
		},
		remove: function(detailModel) {
			detailModel.set('destroy', true);
			return this;
		},
		loadModel: function(cb){
			var detail_model,
					detail_model_id,
					fetch_options = {
						data: {},
						processData: true,
						success: function(collection, response, options){
							cb(response);
						},
						error: function(err){
							console.log('Error fetching article detail' + detail_model_id);
						}
					};

			// First look in the article_detailed collection, we might have stashed one there
			if (collections.article_detailed.instance.length){
				detail_model = collections.article_detailed.instance.first();
				// If that has nothing, then look in the hash
			} else if (false) {
				// TODO, figure out hash situation
				// If that has nothing, grab the first item in the comparison view
			} else {
				detail_model_id = collections.article_comparisons.instance.first().get('id');
				fetch_options.data.article_id = detail_model_id;
			}

			// If one of the other methods have turned up nothing, see if already fetched that detail model from the server?
			// The article id is stored under `article_id` and not `id` because each detail object needs its own unique id, which is separate from the article's commmon id
			if (!detail_model) {
				detail_model = collections.articles_detailed.instance.findWhere({article_id: detail_model_id});
			}
			// console.log(fetch_options.data)

			// If this is a detail model already, then load it
			// If not, we check if we have already loaded it
			// If we dont' have it, we have to fetch it, which will invoke the callback when it's done
			if (detail_model) {
				cb(detail_model);
			} else {
				collections.article_detailed.instance.fetch(fetch_options);
			}

		}
	},

	saveHash: function(){
		var mode = models.section_mode.get('mode'),
				mode_collections = {
					compare: 'article_comparisons',
					detail: 'article_detailed'
				},
				mode_collection = mode_collections[mode]

		var article_ids = collections[mode_collection].instance.getHash();
		routing.router.navigate(mode + '/' + article_ids);
	},

	showHideList: function(e){
		var $btn = $(e.currentTarget),
				open = $btn.attr('data-open') == 'true',
				$list = $btn.parents('.option-container').find('.tag-list'),
				slide_duration = 400,
				text;

		if (open) {
			$list.slideUp(slide_duration, 'easeOutQuint');
			text = 'Show';
		} else {
			$list.slideDown(slide_duration, 'easeOutQuint');
			text = 'Hide';
		}

		$btn.attr('data-open', !open).html(text);

	}
});