app.Articles = Backbone.View.extend({
	el: '#main-wrapper',

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


		this.isotopeCntnr = '.rows';
		this.isotopeChild = '.article-detail-row-wrapper';

		// console.log(collections.po.article_summaries)

		// Where is the full article data stores?
		// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
		// this.drawerData = pageData.articleSummaries;
		// this.single = {
		// 	detailData: helpers.modelsAndCollections.addTagsFromId(pageData.articleDetails),
		// 	Model: models.article_detail.Model
		// }
		// this.compare = {
		// 	detailData: pageData.articleSummaries,
		// 	Model: models.row_item.Model
		// }

		// console.log(this.single.detailData)


		// What are your keys for article ids?
		// The values of these keys need to match, but not necessarily the keys themselves
		// The system is setup so these keys can be different, but they still point to the same unique identifier
		// This defines the relationship between your drawer items and the detail items
		// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
		this.listId = 'id'; // The key on thes summary object that points to the main article id
		this.detailId = 'article_id'; // The key on thes detail object that points to the main article id

		// Update hash and active collection on mode change
		// this.listenTo(models.section_mode, 'change:mode', this.divisionSwitcher.updateCollection);
		// this.listenTo(models.section_mode, 'change:mode', this.articleDetail.prepTheDom);

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

		// Listen for adds and removes to this collection
		this.listenTo(collections.article_summaries.instance, 'add', this.drawer.add);
		this.listenTo(collections.article_summaries.instance, 'remove', this.drawer.remove);


		// // When a summary item has `viewing` set to true
		// // Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
		// this.listenTo(collections.drawer_items.instance, 'change:viewing', app.helpers.itemDetail.go);

		// // Detailed data fetched by `article.set.go` is then either added or removed from a collection
		// // Correspondingly the dom elements are baked or destroyed
		// this.listenTo(collections.detail_items.instance, 'add', this.articleDetail.bake);
		// this.listenTo(collections.detail_items.instance, 'remove', this.articleDetail.destroy);

		// Create views for every one of the models in the collection and add them to the page
		this.bake();
	},

	bake: function(){
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

		new views.DivisionSwitcher({ model: models.section_mode, el: this.$divisionSwitcher })

		return this;
	},
	articleDetail: {
		prepTheDom: function(sectionModel){
			// TODO, maybe this should be dealt with through the divisionSwitcher.updateCollection
			if (sectionModel.get('mode') == 'compare'){
				var article_grid =  new views.ArticleSummaryRow;
				this.$content.html( article_grid.render().el );
			} 
			this.$listContainer = $('#compare-grid .rows');

		},	
		bake: function(detailModel){
			var mode = models.section_mode.get('mode'),
					item_view,
					item_el;

			if (mode == 'single'){
				item_view = new views.ArticleDetail({model: detailModel});
				item_el = item_view.render().el;
				this.$content.html(item_el);

				item_view.bakeInteractiveBits();
				// app.helpers.isotope.addItem.call(this, item_el);
			} else {
				app.helpers.isotope.initCntnr.call(this);
				item_view = new views.ArticleSummaryRow({model: detailModel});
				item_el = item_view.render().el;
				this.$listContainer.append(item_el);

				item_view.update(app.helpers.isotope.addItem);
			}
			return this;
		},
		destroy: function(detailModel){
			detailModel.set('destroy', true);
		}
	},
	divisionSwitcher: {
		updateCollection: function(){
			// Remove all models in the collection, firing the remove event for each one
			// This as the effect of clearing their detail markup
			collections.detail_items.instance.remove( collections.detail_items.instance.models );
			return this;
		},
		updateHash: function(entering_mode, new_id){
			app.helpers.isotope.clearCntnr.call(app.instance);
			// Update the mode in the hash
			// Before you switch
			// Grab the current page numbers listed
			var hash_arr = current_ids = [];
			// var new_ids = ''; // Don't remember prior selection
			var new_ids = new_id || models.section_mode.get('previous-ids') || ''; // Remember prior selection, or passed in selection
			// Only save a previous state if you have a previous article state
			if ( routing.helpers.getArticleIds(window.location.hash) ){
				hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
				current_ids = hash_arr.slice(1, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
				// If we have something previously saved, used that
				// If not, our hash will just stay the same
				new_ids = new_ids || current_ids;
				// // If we're going into single mode and the hash has more than one id, then we'll go to the first one
				if (entering_mode == 'single' && current_ids.length > 1 && !new_id) new_ids = current_ids[0];
				if (_.isArray(new_ids)) new_ids = new_ids.join('&');
			}
			// Set the url hash
			routing.router.navigate(entering_mode + '/' + new_ids, {trigger: true});

			// // Set these ids to `viewing: true`
			// app.helpers.drawer.changeActive.call(app.instance, mode, new_ids);
			// Possible use the `options.previousModels` on the collection to set this, and then you have the actual models
			// Don't safe the current_id if it's an empty array
			if (_.isArray(current_ids) && current_ids.length === 0) current_ids = '';
			models.section_mode.set('previous-ids', current_ids);
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
			console.log(views.po.article_summaries.getCurrentItems());
			return this;
		},
		setActiveArticleSummaries: function(){
			// For changing the drawer list items based on filters
			collections.article_summaries.instance.set(views.po.article_summaries.getCurrentItems());
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
			// app.helpers.isotope.addItem.call(app.instance, item_el);

			return this;
		},
		remove: function(summaryModel){
			// Actions to take when removing an item from the drawer
			summaryModel.set('destroy', true);
		}
	}
});