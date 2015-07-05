app.Articles = Backbone.View.extend({

	el: '#main-wrapper',

	events: {
		'click .add-to-comparison': 'addToComparison',
		'click .option-title .show-hide': 'showHideList',
		'change .toggle-all': 'toggleAllDrawer',
		'click #alter-comparison-marker': 'updateComparisonMarker',
		'click .load-more[data-which="article-summaries"]': 'moreSummaryArticles',
		'click .go-to-detail': 'goToDetail',
		// 'click .modal-toggle': 'toggleModal',
		// 'click .modal-close': 'toggleModal'
	},

	initialize: function(){
		// Keep track of views rendered by this view
		this._subviews = [];

		// Cache these selectors
		this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
		this.$impactTagCategoriesList = $('.option-container[data-type="categories"] .tag-list');
		this.$impactTagLevelsList = $('.option-container[data-type="levels"] .tag-list');
		this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
		
		this.tag_list_els = {
			subject_tags: this.$subjectTagList.parent(),
			categories: this.$impactTagCategoriesList.parent(),
			levels: this.$impactTagLevelsList.parent(),
			impact_tags: this.$impactTagList.parent()
		};

		this.$articleList = $('#article-list');
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');
		this.$drawerPointersCntnr = $('#drawer-pointers-container');
		this.$articleTitleSearcher = $('#article-title-searcher');
		this.$dateRangeSearcher = $('#date-range-searcher');
		this.$articleDrawerSorter = $('#article-drawer-sorter');
		this.$addArticle = $('#add-article');


		this.isotopeCntnr = '.rows';
		this.isotopeChild = '.article-detail-row-wrapper';


		// Update hash and active collection on mode change
		this.listenTo(models.section_mode, 'change:mode', this.sectionMode.update);

		// Listen for adds and removes to the article summaries collection
		// And populate the drawer on `add` and `remove`
		// this.listenTo(collections.article_summaries.instance, 'change', this.updateToggle);
		this.listenTo(collections.article_summaries.instance, 'add', this.drawer.add);
		this.listenTo(collections.article_summaries.instance, 'remove', this.drawer.remove);
		this.listenTo(collections.article_summaries.instance, 'error', this.reportErr);


		// As you move things in and out of the comparison view
		// Listen to its collection and `add` and `remove things accordingly
		this.listenTo(collections.article_comparisons.instance, 'add', this.comparison.add);
		this.listenTo(collections.article_comparisons.instance, 'remove', this.comparison.remove);

		// When an item is added or removed from the detail collection, add or remove it
		// The remove is somewhat unnecessary since `this.$content`'s html is emptied. But it's consistent with our other code.
		this.listenTo(collections.article_detailed.instance, 'add', this.detail.add);
		this.listenTo(collections.article_detailed.instance, 'remove', this.detail.remove);
		this.listenTo(collections.article_detailed.instance, 'error', this.reportErr);

		// Listen for changes in facet counts and show hide all tag controls
		this.listenTo(models.tag_facets, 'change', this.updateTagContainerByCounts);
		// Listen for changes in facet counts and show hide all tag controls
		this.listenTo(models.content_item_filters, 'hasChanged', this.fetchByParameters);


		// Create views for every one of the models in the collection and add them to the page
		this.render();

		// Listen to scroll so you can sticky the filter
		var that = this;
		this.$content.on('scroll', function(){
			var $content = $(this);
			that.onScrollTick.call(that, $content);
		})
	},

	render: function(){

		this.$drawerPointersCntnr.append(templates.drawerPointers);

		/* Drawer tag */
		// Article tags
		if (collections.subject_tags.instance.length){
			this.$subjectTagList.html('');
			collections.subject_tags.instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$subjectTagList.append(tag_view.render().el);
			}, this);
		}

		// Impact tags
		if (collections.impact_tags.instance.length){
			this.$impactTagList.html('');
			collections.impact_tags.instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (collections.impact_tag_attributes.categories_instance.length){
			this.$impactTagCategoriesList.html('');
			collections.impact_tag_attributes.categories_instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (collections.impact_tag_attributes.levels_instance.length){
			this.$impactTagLevelsList.html('');
			collections.impact_tag_attributes.levels_instance.each(function(tag){
				var tag_view = new views.TagSectionNav({ model: tag });
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		/* Article Summaries in the drawer */
		collections.article_summaries.instance.each(function(article){
			var article_view = new views.ArticleSummaryDrawer({model: article});
			this.$articleList.append(article_view.render().el);
		}, this);

		// If you have subject tags, render them as options in the article comparison dropdowns
		collections.subject_tags.instance.each(function(subjectTag){
			var $option = $('<option></option>').val(subjectTag.get('id')).html(subjectTag.get('name'))
			$option.appendTo('.alter-comparison-marker[data-which="group"]');
		});

		// These views are okay to stick around (ie. not added to the subviews array and killed at any point) because they are only created once and then the page is refreshed, which clears them
		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher });

		console.log(this.$articleTitleSearcher)
		new views.ArticleSearcher({el: this.$articleTitleSearcher[0]});

		new views.DateRangeSearcher({el: this.$dateRangeSearcher[0]});

		new views.ArticleDrawerSorter({el: this.$articleDrawerSorter[0], collection: collections.dimensions.instance});

		this.bakeArticleAdder();

		// Hide the tag lists based on what the counts are
		this.updateTagContainerByCounts();

		this.setLoading(this.$drawer, 'false');
		this.$articleCount = this.$drawer.find('.item-text[data-which="article-count"]');

		this.setLoadMoreButton();

		return this;
	},

	setLoading: function($target, state){
		$target.attr('data-loading', state);
	},

	reportErr: function(model, msg){
		var response = msg.responseJSON;
		console.log('ERROR in model:', model);
		console.log('ERROR message:', response);
		alert(response.error  +' ' + response.status_code + ': ' + response.message);
	},

	fetchByParameters: function(increment){
		var params = models.content_item_filters.assembleQueryParams();
		var current_page = collections.article_summaries.instance.metadata('pagination').page;

		console.log('params',params);

		if (!increment){
			// Set the loading state
			// Which will hide the button, otherwise we want the button to be visible
			app.instance.setLoading.call(app.instance, app.instance.$articleList, true);
			// Clear the set
			collections.article_summaries.instance.set([]);
		} else {
			params.page = current_page + 1;
		}
		// Responsive articles will be added to `collections.article_summaries.instance`
		// `pagination and `total` information will be added as metadata on that collection
		collections.article_summaries.instance.fetch({data: params, remove: false})
			.then(function(model, status, response){
				// This is only called on success, error are caught by our listener above
				app.instance.setLoading.call(app.instance, app.instance.$articleList, false);
				app.instance.setLoadMoreButton.call(app.instance);
			});

		return this;
	},

	sectionMode: {
		update: function(model, mode){
			mode = mode || model.get('mode');

			// Kill all subviews
			// this.killAllSubviews();
			// Possibly replace this with
			collections.article_comparisons.instance.set([]);
			collections.article_detailed.instance.set([]);

			// Roll out section-secpfic code
			this.sectionMode[mode].call(this);

			// If we had some models already in a collection, we'll want to adjust their selection state
			// Do this after the sectionMode call so that all of our listeners are bound
			collections.article_summaries.instance.each(function(articleSummary){
				var section_selection_key = 'selected_for_' + mode,
						selected_for_section = articleSummary.get(section_selection_key);

				articleSummary.set('active_selected', selected_for_section);
			});

			return this;
		},
		compare: function(){

			var article_grid =  new views.ArticleComparisonGrid({collection: collections.dimensions.instance});
			// // Keep track of this view
			this._subviews.push(article_grid);

			this.$content.html( article_grid.render().el );

			this.$listContainer = $('#compare-grid .rows');
			// Init isotope on the `$listContainer`
			var select_sorters = collections.dimensions.instance.getSelectsForIsotope();
			app.helpers.isotope.initCntnr.call(this, select_sorters);

			// Set the sort on our comparison grid
			var initial_sort_by = collections.article_comparisons.instance.metadata('sort_by');
			var initial_sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');

			// And enable the toggle all and add to comparison buttons
			this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button')
				.prop('disabled', false)
				.parent()
					.removeClass('disabled');

			// Get the parameters by which we're sorting the comparisons
			var sort_by = collections.article_comparisons.instance.metadata('sort_by'),
					sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending');
			$('.header-el').attr('data-sort-ascending', sort_ascending);

			// Set the compare view to the staged set of models
			// On load this will be json, but if we're coming from the detail view, we'll already have things so let's load those
			// On load `this.staged_article_comparisons` will be undefined so grab the ids of the article summaries
			// Unless we've been told to stop by an incoming route
			var staged_article_comparison_models;
			var compare_models;
			if (!this.pause_init){
				console.log('setting headers',sort_by, sort_ascending)
				// This next line needs to be refactored so that data is being upated and the view reflects that
				// article_grid.sortBy.call(article_grid, initial_sort_by, initial_sort_ascending);
				collections.article_comparisons.instance.trigger('sortMetricHeaders');
				staged_article_comparison_models = this.staged_article_comparison_models || collections.article_summaries.instance.models;
				// var staged_article_comparison_models = this.staged_article_comparison_models || collections.article_summaries.instance.models;
				compare_models = this.comparison.loadRows(staged_article_comparison_models, this.saveHash); // Analagous to this.detail.loadPage excempt doesn't require fetching because article summaries are already loaded
				this.staged_article_comparison_models = staged_article_comparison_models;
				
			}

			return this;
		},
		detail: function(detailModelId){
			// We have `detailModelId` if we're coming from a summary drawer click
			// But if we're coming from a `.go-to-detail` click, changing modes triggers an update and thus we need to preload the model id under `staged_article_detail`
			detailModelId = detailModelId || this.staged_article_detail
			// TODO, put a loading gif in here
			// Kill the toggle all button and add to replace buttons
			this.$drawer.find('.drawer-item-group[data-which="comparison-additions"] input,.drawer-item[data-type="action-item"] button').prop('disabled', true).parent().addClass('disabled');

			// Figure out which model we are loading and add it to collections.article_detailed.instance
					// 		this.detail.getDetailModelFromId.call(this, detailModelId, cb);



			this.detail.loadPage.call(this, detailModelId, this.saveHash);
			return this;
		}
	},

	toggleAllDrawer: function(e){
		var checked = $(e.currentTarget).find('input').prop('checked'),
				mode = models.section_mode.get('mode'),
				selected_for = 'selected_for_' + mode;

		collections.article_summaries.instance.each(function(summaryModel){
			// Persist and set mode
			if (mode == 'compare') {
				summaryModel.set(selected_for, checked);
			}
			summaryModel.set('active_selected', checked);
		});
		return this;
	},

	drawer: {
		setActiveArticleSummaries: function(){
			// var current_filtered_set = views.po.article_summaries.getCurrentItems();
			// To maintain the correct sort order on the dom, we want to empty it
			collections.article_summaries.instance.set([]);
			// For changing the drawer list items based on filters
			collections.article_summaries.instance.set(current_filtered_set);
			app.instance.setLoadMoreButton.call(app.instance);

			// Make the checkboxes shift-selectable
			app.instance.$drawer.find('.drawer-list-outer').shiftSelectable();

			return this;

		},
		add: function(summaryModel){
			// Actions to take when adding an item to the drawer
			var item_view,
				item_el;

			item_view = new views.ArticleSummaryDrawer({model: summaryModel});
			item_el = item_view.render().el;
			this.$articleList.append(item_el);

			return this;
		},
		remove: function(summaryModel){
			// Actions to take when removing an item from the drawer
			summaryModel.trigger('destroy');
			return this;
		}

	},

	addToComparison: function(e){
		var $btn = $(e.currentTarget),
				action = $btn.attr('data-action'),
				sort_by,
				sort_ascending;

		// Only add items that are both selected and `in_drawer` which is `true` when it comes from a pourover filter
		var selected_models = collections.article_summaries.instance.where({selected_for_compare: true}),
				action;

		// Either replace or append
		if (action == 'replace'){
			action = 'set';
		} else if (action == 'add'){
			action = 'add';
		}

		collections.article_comparisons.instance[action](selected_models);

		// Persist these models by saving their ids
		this.staged_article_comparison_models = collections.article_comparisons.instance.slice(0);

		// Grab our params to sort from metadata elements on our collection
		sort_by = collections.article_comparisons.instance.metadata('sort_by')
		sort_ascending = collections.article_comparisons.instance.metadata('sort_ascending')
		app.helpers.isotope.relayout(sort_by, sort_ascending);

		console.log('adding to comparison')
		this.saveHash();

		return this;

	},

	comparison: {

		add: function(summaryModel) {
			// Actions to take when adding an item to the comparison grid
			var item_view,
				item_el;

			item_view = new views.ArticleSummaryRow({model: summaryModel, collection: collections.dimensions.instance});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$listContainer.append(item_el);
			app.helpers.isotope.addItem.call(app.instance, item_el);
			return this;
		},

		remove: function(comparisonModel) {
			comparisonModel.trigger('removeFromComparison');
			// comparisonModel.set('destroy', 'delete');
			// app.instance.saveHash();
			return this;
		},

		loadRows: function(stagedArticleComparisonModels, saveHash){

			collections.article_comparisons.instance.set(stagedArticleComparisonModels);

			// Pass asn argument so as to be consistent with how `detail.loadPage` works, also handles passing in a reference to this
			saveHash();

			// // If we don't have any already in our comparison, then grab what's selected in the drawer
			// // Note, this condition will most likely be on load so the `selected_for_compare: true` is a bit meaningless
			// // Since many of those models load with `selected_for_compare: true`
			// // But it could also trigger if you just deleted everything from the compare grid
			// // In that case, grabbing just the selected ones is a better choice since it seems closer so the user's intention
			// // But also it avoids loading a TON of models accidentally.
			// if (!compare_models.length){
			// 	// If we don't have anything incoming in the hash, then grab what's in the drawer as we discussed before
			// 	// TODO, also look in the hash if we're coming from a permalink
			// 	compare_models = collections.article_summaries.instance.where({selected_for_compare: true, in_drawer: true});

			// 	// Make sure these models get sorted in the proper way that our collection is sorted
			// 	// You would think that adding them to our sorted collection would take care of this
			// 	// but the sort doesn't change the order in which add events are fired, which is how we're adding things
			// 	// Perhaps isotope layout could be called again to take care of that... For now, this works and it keeps our data sorted and clean
			// 	if (sort_by){
			// 		compare_models = _.sortBy(compare_models, function(compare_model){ return compare_model.get(sort_by) });
			// 		if (sort_ascending === false) {
			// 			compare_models.reverse();
			// 		}
			// 	}
			// }

			return this;

		}
	},

	detail: {
		add: function(detailModel) {
			// Vars for baking account subject tags
			var item_view,
					item_el;

			// Actions to take when adding an item to the detail view
			item_view = new views.ArticleDetail({model: detailModel});
			this._subviews.push(item_view);


			item_el = item_view.render().el;
			this.$content.html(item_el);
			// This is called after the view has rendered instead of as a part of it because we're doing some dynamic layout calculation
			// If we did more harcoding of that then we could call it before it's appended to the DOM, but this way gives us more layout flexibility
			item_view.bakeInteractiveBits();

			return this;
		},
		remove: function(detailModel) {

			detailModel.trigger('destroyDetail');
			// detailModel.set('destroy', true);
			return this;
		},
		loadPage: function(detailModelId, saveHash){
			var that = this;

			// Could be in either one of these
			var summary_model = collections.article_summaries.instance.findWhere({id: detailModelId})
													|| collections.article_comparisons.instance.findWhere({id: detailModelId});

			// If that didn't get anything, then we're fetching, so set the fetch options
			var detail_model;
			if (!summary_model){
				var detail_model = new models.article_detailed.Model({id: detailModelId});

				detail_model.fetch().then(function(){
					collections.article_detailed.instance.set([detail_model]);
					saveHash();
				})
			} else {
				summary_model.set('active_selected', true);
				summary_model.set('selected_for_detail', true);
				collections.article_detailed.instance.set([summary_model]);

				saveHash();
				this.staged_article_detail = detailModelId;

			}

		},
	
	},

	saveHash: function(){
		var mode = models.section_mode.get('mode'),
				mode_collections = {
					compare: 'article_comparisons',
					detail: 'article_detailed'
				},
				mode_collection = mode_collections[mode];

		var article_ids = collections[mode_collection].instance.getHash();
		// Only add the trailing slash if there are ids that follow
		if (article_ids){
			article_ids = '/' + article_ids
		}

		console.log('navigating')
		routing.router.navigate(mode + article_ids);
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

	},

	moreSummaryArticles: function(e){
		app.helpers.gifizeLoadMoreButton($(e.currentTarget));

		this.fetchByParameters(true);

		return this;
	},

	clearLoadMoreButton: function(){
		this.$drawer.find('.load-more').remove();
	},

	setLoadMoreButton: function(){

		// To be created and appended below, if we need it.
		var $loadMore;

		// Always kill the button
		this.clearLoadMoreButton();

		var article_summaries_collection = collections.article_summaries.instance;
		var pagination_info = article_summaries_collection.metadata('pagination');

		var current_page = pagination_info.page,
				page_size = pagination_info.per_page,
				total_pages = pagination_info.total_pages;

		var currently_loaded_count = article_summaries_collection.length,
				total_pending_for_search = article_summaries_collection.metadata('total');

		// Do we need the button
		var more_alerts_to_load = current_page < total_pages,
				remaining_alerts = total_pending_for_search - currently_loaded_count,
				to_load_string = _.min([remaining_alerts, page_size]), // Say you'll load either a full page or how many are left, whichever is smaller
				text_str,
				button_str;

		text_str = 'Showing ' + currently_loaded_count + ' out of ' + total_pending_for_search;

		this.$articleCount.html(text_str);


		if (more_alerts_to_load){
			// Create a little button in-memory (for now)
			$loadMore = $('<button class="load-more"></button>');
			button_str = 'Load ' + to_load_string + ' more...'

			// Finally, append it as the last thing
			$loadMore.html(button_str).appendTo(this.$articleList);
		}

		return this;

	},

	updateComparisonMarker: function(e){
		var operation = $('.alter-comparison-marker[data-which="operation"]').val(),
				group     = $('.alter-comparison-marker[data-which="group"]').val();

		collections.article_comparisons.instance.metadata('operation', operation);
		collections.article_comparisons.instance.metadata('group', group);
		collections.article_comparisons.instance.redrawMarkers();

		return this;
	},

	onScrollTick: function($content){
		var that = this,
				stuck,
				buffer = 5,
				sticky_original_offset;
		// Vars to detect if at bottom
		var content_scrollHeight = $content[0].scrollHeight,
				content_scrollTop = $content.scrollTop();

		var $sticky = this.$el.find('.sticky');

		if ($sticky.length){
			sticky_original_offset = +$sticky.attr('data-offset');

			if (content_scrollTop >= sticky_original_offset - buffer) {
				stuck = true;
			} else {
				stuck = false;
			}
			$sticky.toggleClass('stuck', stuck);
		}
	},

	goToDetail: function(e){
		// Convert to number
		var article_id = +$(e.currentTarget).attr('data-id');
		
		// Make our target id what we clicked on 
		this.staged_article_detail = article_id;
		var current_mode = models.section_mode.get('mode');

		// If we aren't in detail mode, setting it will be enough to bring about a page change
		if (current_mode != 'detail') {
			models.section_mode.set('mode', 'detail');
		// Otherwise if we are in detail mode, then skip the prep part and load this model
		} else {
			console.log('here', article_id)
			this.sectionMode.detail.call(this, article_id);
		}
		return this;
	},

	bakeArticleAdder: function(){
		var defaults = {};

		// Create an instance of an event creator view
		var add_article_view = new views.AddArticle({defaults: defaults, el: this.$addArticle[0]});
		// this._subviews.push(add_article_view);
		this._time_picker = add_article_view._time_picker;
		return this;
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	updateTagContainerByCounts: function(){

		_.each(this.tag_list_els, function($el, key){
			var facet = models.tag_facets.get(key);
			$el.find('.count').html(facet.length);
			var has_facet = facet.length > 0;
			$el.toggleClass('disabled', !has_facet);

		}, this);

		return this;
	}


});