app = app || {};

app.Articles: Backbone.View.extend({
	el: '#main-wrapper',

	initialize: function(){

		// Cache these selectors
		this.$subjectTagList = $('.option-container[data-type="subject-tags"] .tag-list');
		this.$impactTagList = $('.option-container[data-type="impact-tags"] .tag-list');
		this.$articleList = $('#article-list');
		this.$drawer = $('#drawer');
		this.$content = $('#content');
		this.$divisionSwitcher = $('.division-switcher');


		this.isotopeCntnr = '.rows';
		this.isotopeChild = '.article-detail-row-wrapper';

		// Where is the full article data stores?
		// This is the array of objects we'll filter by id in order to get the crossover data from our summary items
		this.drawerData = pageData.articleSummaries;
		this.single = {
			detailData: modelCollectionHelpers.addTagsFromId(pageData.articleDetails),
			Model: models.detail_item.Model
		}
		this.compare = {
			detailData: pageData.articleSummaries,
			Model: models.row_item.Model
		}

		console.log(this.single.detailData)


		// What are your keys for article ids?
		// The values of these keys need to match, but not necessarily the keys themselves
		// The system is setup so these keys can be different, but they still point to the same unique identifier
		// This defines the relationship between your drawer items and the detail items
		// So you can say, get me things from my drawer item model under id `x` that match the id that is stored on my detail model under id `y`.
		this.listUid = 'uid'; // The key on thes summary object that points to the main article id
		this.detailUid = 'article_uid'; // The key on thes detail object that points to the main article id

		// Update hash and active collection on mode change
		this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateCollection);
		this.listenTo(models.section_mode.instance, 'change:mode', this.articleDetail.prepTheDom);

		// Listen for the change event on the collection.
		// This is equivalent to listening on every one of the 
		// model objects in the collection.
		this.listenTo(collections.subject_tags.instance, 'change:active', this.drawer.filter);
		this.listenTo(collections.impact_tags.instance, 'change:active', this.drawer.filter);

		// When a summary item has `viewing` set to true
		// Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
		this.listenTo(collections.drawer_items.instance, 'change:viewing', app.helpers.itemDetail.go);

		// Detailed data fetched by `article.set.go` is then either added or removed from a collection
		// Correspondingly the dom elements are baked or destroyed
		this.listenTo(collections.detail_items.instance, 'add', this.articleDetail.bake);
		this.listenTo(collections.detail_items.instance, 'remove', this.articleDetail.destroy);

		// Create views for every one of the models in the collection and add them to the page
		this.bake();
	},

	bake: function(){
		// Article tags
		collections.subject_tags.instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$subjectTagList.append(tag_view.render().el);
		}, this);
		// Impact tags
		collections.impact_tags.instance.each(function(tag){
			var tag_view = new views.Tag({ model: tag });
			this.$impactTagList.append(tag_view.render().el);
		}, this);

		// Article list
		collections.drawer_items.instance.each(function(article){
			var article_view = new views.DrawerListItem({model: article});
			this.$articleList.append(article_view.render().el);
		}, this);

		new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })

		return this;
	},
	articleDetail: {
		prepTheDom: function(sectionModel){
			// TODO, maybe this should be dealt with through the divisionSwitcher.updateCollection
			if (sectionModel.get('mode') == 'compare'){
				var article_grid =  new views.ArticleDetailGrid()
				this.$content.html( article_grid.render().el );
			} 
			this.$listContainer = $('#compare-grid .rows');

		},	
		bake: function(detailModel){
			var mode = models.section_mode.instance.get('mode'),
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
				item_view = new views.ArticleDetailRow({model: detailModel});
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
		updateHash: function(entering_mode, new_uid){
			app.helpers.isotope.clearCntnr.call(app.instance);
			// Update the mode in the hash
			// Before you switch
			// Grab the current page numbers listed
			var hash_arr = current_uids = [];
			// var new_uids = ''; // Don't remember prior selection
			var new_uids = new_uid || models.section_mode.instance.get('previous-uids') || ''; // Remember prior selection, or passed in selection
			// Only save a previous state if you have a previous article state
			if ( routing.helpers.getArticleUids(window.location.hash) ){
				hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
				current_uids = hash_arr.slice(1, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
				// If we have something previously saved, used that
				// If not, our hash will just stay the same
				new_uids = new_uids || current_uids;
				// // If we're going into single mode and the hash has more than one uid, then we'll go to the first one
				if (entering_mode == 'single' && current_uids.length > 1 && !new_uid) new_uids = current_uids[0];
				if (_.isArray(new_uids)) new_uids = new_uids.join('&');
			}
			// Set the url hash
			routing.router.navigate(entering_mode + '/' + new_uids, {trigger: true});

			// // Set these ids to `viewing: true`
			// app.helpers.drawer.changeActive.call(app.instance, mode, new_uids);
			// Possible use the `options.previousModels` on the collection to set this, and then you have the actual models
			// Don't safe the current_uid if it's an empty array
			if (_.isArray(current_uids) && current_uids.length === 0) current_uids = '';
			models.section_mode.instance.set('previous-uids', current_uids);
			return this;
		}
	},

	drawer: {
		filter: function(){
			// var active_tags = load.summaries.by.tag()
			return this;
		},
		bake: function(){
			// For changing the drawer list items based on filters
		}
	}
})