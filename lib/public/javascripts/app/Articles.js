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


		// Update hash and active collection on mode change
		// this.listenTo(models.section_mode, 'change:mode', this.divisionSwitcher.updateCollection);
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// Listen for changes across collection of drawer items 
		// article selection and update the drawer with appropriate article summaries
		// These are all in separate collections 1) because that's how we loaded them separated them
		// And so that we can grab the collection information as its filter group
		this.listenTo(collections.subject_tags.instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.impact_tags.instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.impact_tag_attributes.categories_instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.impact_tag_attributes.levels_instance, 'change:active', this.drawer.filter);

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

		// Listen for adding things from the page and bake them
		// TODO, these could possibly be triggered from the `collections.article_detailed.instance` set event 
		this.listenTo(collections.article_detailed_subject_tags.instance, 'add', this.detail.subject_tags.add);
		this.listenTo(collections.article_detailed_subject_tags.instance, 'remove', this.detail.subject_tags.remove);

		// Do the same thing for impact categories
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'add', this.detail.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'remove', this.detail.impact_tag_attribute.remove);

		// And levels
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'add', this.detail.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'remove', this.detail.impact_tag_attribute.remove);

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
		collections.impact_tag_attributes.categories_instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$impactTagCategoriesList.append(tag_view.render().el);
		}, this);
		// Impact tag levels
		collections.impact_tag_attributes.levels_instance.each(function(tag){
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
			this.detail.loadModel.call(this, this.staged_article_detail, this.detail.loadPage)

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
			// This is called after the view has rendered instead of as a part of it because we're doing some dynamic layout calculation
			// If we did more harcoding of that then we could call it before it's appended to the DOM, but this way gives us more layout flexibility
			item_view.bakeInteractiveBits();

			return this;
		},
		remove: function(detailModel) {
			detailModel.set('destroy', true);
			return this;
		},
		loadPage: function(model){
			var subject_tags_full,
					impact_tag_categories,
					impact_tag_levels;

			// Populate our detailed collection with our fetched model
			// This will call `this.detail.add` on it and bake it to the DOM
			collections.article_detailed.instance.set(model);

			// Append some things after the HTML has been baked
			// Such as tags
			this.$subjectTagsContainer         = this.$content.find('.tag-container[data-which="subject"] ul.tags');
			this.$impactTagCategoriesContainer = this.$content.find('.tag-container[data-which="impact-categories"] ul.tags');
			this.$impactTagLevelsContainer     = this.$content.find('.tag-container[data-which="impact-levels"] ul.tags');

			// Set up the other collections and page elements
			// Populate tags into the subject_tag
			subject_tags_full     = model.get('subject_tags_full');
			impact_tag_categories = model.get('impact_tag_categories');
			impact_tag_levels     = model.get('impact_tag_levels');
			// If we have subject tags, clear our placeholder 'No tags' and add the real tags
			if (subject_tags_full.length){
				this.$subjectTagsContainer.html('');
				collections.article_detailed_subject_tags.instance.set(subject_tags_full);
			}

			// Impact tag categories
			if (impact_tag_categories.length){
				this.$impactTagCategoriesContainer.html('');
				collections.article_detailed_impact_tag_attributes.categories_instance.set(impact_tag_categories);
			}

			// Impact tag levels
			if (impact_tag_levels.length){
				this.$impactTagLevelsContainer.html('');
				collections.article_detailed_impact_tag_attributes.levels_instance.set(impact_tag_levels);
			}

			this.saveHash();
		},
		getDetailModelFromId: function(detail_model_id, cb){
			var that = this,
					fetch_options = {
						data: {id: detail_model_id},
						processData: true,
						success: function(collection, response, options){
							cb.call(that, response);
						},
						error: function(err){
							console.log('Error fetching article detail' + detail_model_id);
						}
					},
					detail_model;

			detail_model = collections.articles_detailed.instance.findWhere({id: detail_model_id});

			// If that didn't get anything, then we're fetching, so set the fetch options
			if (!detail_model){
				collections.article_detailed.instance.fetch(fetch_options);
			} else {
				cb.call(this, detail_model);
			}

		},
		loadModel: function(detail_model_id, cb){

			// If we don't have a detailed model id
			// Get the id of the first thing in the comparison row 
			if (!detail_model_id){
				detail_model_id = collections.article_comparisons.instance.first().get('id');
			}

			this.detail.getDetailModelFromId.call(this, detail_model_id, cb);

			// First look if we're staging an article id
			// TODO, The hash should put the id under this variable also
			// if (app.instance.staged_article_detail){
			// 	detail_model_id = app.instance.staged_article_detail;
			// } else if (collections.article_detailed.instance.length){
			// // If we dont  have anything then look if we might have something already pre-laoded from when we were on this page before
			// // From here on out, we're just kind of looking for something to load, since the stager is the only real intentional
			// 	detail_model = collections.article_detailed.instance.first();
			// } else {
			// 	// If that has nothing, grab the id of first item in the comparison view
			// 	detail_model_id = collections.article_comparisons.instance.first().get('id');
			// }

			// // If we returned a detail_model_id, see if we have already loaded it before we try fetching it from the server
			// if (detail_model_id) {
			// 	detail_model = collections.articles_detailed.instance.findWhere({id: detail_model_id});
			// 	// If that didn't get anything, then we're fetching, so set the fetch options
			// 	if (!detail_model){
			// 		fetch_options.data.article_id = detail_model_id;
			// 	}
			// }

			// // If this is a detail model already, then load it
			// // If not, we check if we have already loaded it
			// // If we dont' have it, we have to fetch it, which will invoke the callback when it's done
			// if (detail_model) {
			// 	cb.call(this, detail_model);
			// } else {
			// 	collections.article_detailed.instance.fetch(fetch_options);
			// }

			// Clear this so we don't always load this id
			// app.instance.staged_article_detail = false;

		},
		subject_tags: {
			add: function(subjectTagModel){
				item_view = new views.ArticleDetailSubjectTag({model: subjectTagModel});
				item_el = item_view.render().el;
				this.$subjectTagsContainer.append(item_el);
				return this;
			},
			remove: function(){
				// TODO, do remove
				console.log('remove tag');
				return this;
			}
		},
		impact_tag_attribute: {
			add: function(attributeModel, collection){
				// This will tell us if we should append to the `category` or `level` list
				var which_collection = collection.metadata('which'),
						containers = {
							categories: this.$impactTagCategoriesContainer,
							levels: this.$impactTagLevelsContainer    
						},
						container = containers[which_collection];

				item_view = new views.ArticleDetailAttributeTag({model: attributeModel});
				item_el = item_view.render().el;
				container.append(item_el);
				return this;
			},
			remove: function(){

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