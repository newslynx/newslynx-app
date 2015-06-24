templates.init = {
	articles: function(){
		this.tagFactory = _.template( $('#tag-templ').html() );
		this.articleSummaryDrawerFactory = _.template( $('#article-summary-drawer-templ').html() );
		this.drawerPointers = $('#drawer-pointers-templ').html();
		this.articleGridContainerFactory = _.template( $('#article-grid-container-templ').html() );
		this.articleSummaryRowFactory = _.template( $('#article-summary-row-templ').html() );
		this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
		this.articleDetailTagFactory = _.template( $('#article-detail-tag-templ').html() );
		this.articleDetailAccountSubjectTagFactory = _.template( $('#article-detail-account-subject-tag-templ').html() );
	},
	"approval-river": function(){
		this.drawerMyRecipesPrepFactory 	= _.template( $('#drawer-my-recipes-templ').html() );
		this.drawerCreatePrep							=  $('#drawer-create-templ').html();
		this.alertFactory 								= _.template( $('#alert-templ').html() );
		this.recipeFactory 								= _.template( $('#recipe-templ').html() );
		this.recipeStaticFactory  				= _.template( $('#recipe-static-templ').html() );
		this.sousChefDrawerItemFactory 	  = _.template( $('#sous-chef-drawer-item-templ').html() );
		this.sousChefFormFactory		 			= _.template( $('#sous-chef-form-templ').html() );

	},
	settings: function(){
		this.inputActionsFactory = _.template( $('#input-actions-templ').html() );
		this.subjectTagFactory = _.template( $('#subject-tag-templ').html() );
		this.impactTagFactory = _.template( $('#impact-tag-templ').html() );
		this.rssFeedRecipeFactory = _.template( $('#rss-feed-templ').html() );
		this.staffTwitterListRecipeFactory = _.template( $('#staff-twitter-feed-templ').html() );
		this.twitterUserRecipeFactory = _.template( $('#twitter-user-templ').html() );
		this.facebookPageRecipeFactory = _.template( $('#facebook-page-templ').html() );
		this.modalFactory = _.template( $('#modal-templ').html() );
	}
}

models.init = {
	articles: function(){
		// Keep track of the tag facet counts. Those views will listen to changes on this model to update themselves
		// Fetching new articles will update this model
		this.tag_facets = new models.generic.Model(pageData.tags.facets);
		this.content_item_filters = new models.content_item_filters.Model({sort_by: pageData.articleSummariesInfo.sort_by});
		this.comparison_metrics = new models.generic.Model(pageData.comparisonMetrics);
		// Keep track of whether we're in single view or comparison view
		this.section_mode = new models.generic.Model();
		// Create an empty object on this model to fill in later
		this.section_mode.compare = {};
	},
	"approval-river": function(){
		// Keep track of whether we're in `my-recipes or 'create-new' view
		this.section_mode = new models.generic.Model();
	},
	settings: function(){
		this.org.instance = new this.org.Model(pageData.org);
	}
}

collections.init = {
	articles: function(){
		// Subject Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.tags.subject);
		// What the api query parameter key is
		this.subject_tags.instance.metadata('filter', 'subject_tag_ids');

		// Impact tags
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.tags.impact);
		// What the api query parameter key is
		this.impact_tags.instance.metadata('filter', 'impact_tag_ids');
		// Impact tag categories
		this.impact_tag_attributes.categories_instance = new this.impact_tag_attributes.Collection(pageData.tags.categories);
		this.impact_tag_attributes.levels_instance = new this.impact_tag_attributes.Collection(pageData.tags.levels);
		// Same as above
		// These meta fields are used on click to determine the filter to be applied
		this.impact_tag_attributes.categories_instance.metadata('filter', 'categories');
		this.impact_tag_attributes.levels_instance.metadata('filter', 'levels');

		// Because tags view instances can apply to both summary drawer filtering and event filtering
		// Stash a variable here to set up which `collections.po` collection to alter
		// `collections.po.article_summaries` or `collections.po.article_detailed_events`
		// this.subject_tags.instance.metadata('po_collection', 'article_summaries');
		// this.impact_tags.instance.metadata('po_collection', 'article_summaries');

		// I still might user pourover for filtering events
		this.impact_tag_attributes.categories_instance.metadata('po_collection', 'article_summaries');
		this.impact_tag_attributes.levels_instance.metadata('po_collection', 'article_summaries');


		// Store our full dimensions list here and via metadata `selects`, pick out which ones we care about
		this.dimensions.instance = new this.dimensions.Collection(pageData.dimensionsInfo.dimensions);
		this.dimensions.instance.metadata('sort_by', pageData.dimensionsInfo.sort_by);
		
		// // Pourover collections
		// this.po.article_summaries = new PourOver.Collection(pageData.articleSummaries);
		// // Make filters
		// var subject_tag_ids 					= pageData.tags.subject.map(function(subjectTag){ return subjectTag.id }),
		// 		impact_tag_ids 						= pageData.tags.impact.map(function(impactTag){ return impactTag.id }),
		// 		impact_tag_category_names = pageData.tags.categories.map(function(impactTagCategory){ return impactTagCategory.name; }),
		// 		impact_tag_level_names 		= pageData.tags.levels.map(function(impactTagLevel){ return impactTagLevel.name; });

		// var subject_tags_filter 				= PourOver.makeInclusionFilter('subject_tags', subject_tag_ids),
		// 		impact_tags_filter  				= PourOver.makeInclusionFilter('impact_tags', impact_tag_ids),
		// 		impact_tag_category_filter 	= PourOver.makeInclusionFilter('impact_tag_categories', impact_tag_category_names),
		// 		impact_tag_level_filter 		= PourOver.makeInclusionFilter('impact_tag_levels', impact_tag_level_names);


		// // We'll populate this with cids from our text inputting via Bloodhound
		// var text_search_filter = PourOver.makeManualFilter('title');

		// // Timestamp filter, which will be triggered from the UI via Pikaday
		// var timestamp_filter = PourOver.makeContinuousRangeFilter("timestamp", {attr: "timestamp"})

		// // Save some of these filters for later
		// // Like when we filter events by these 
		// this.po.filters = {
		// 	impact_tags: impact_tags_filter,
		// 	impact_tag_categories: impact_tag_category_filter,
		// 	impact_tag_levels: impact_tag_level_filter,
		// 	timestamps: timestamp_filter
		// };

		// this.po.article_summaries.addFilters([subject_tags_filter, impact_tags_filter, impact_tag_category_filter, impact_tag_level_filter, text_search_filter, timestamp_filter]);

		// // Create a bunch of sorts
		// var timestampSortDesc = init.common.makePourOverSort('timestamp'),
		// 		pageviewsSortDesc = init.common.makePourOverSort('pageviews'),
		// 		twitterMentionsSortDesc = init.common.makePourOverSort('twitter'),
		// 		facebookLikesSortDesc = init.common.makePourOverSort('facebook'),
		// 		avgTimeOnPageSortDesc = init.common.makePourOverSort('avg_time_on_page'),
		// 		perInternalSortDesc = init.common.makePourOverSort('per_internal'),
		// 		perExternalSortDesc = init.common.makePourOverSort('per_external');

		// // Create sorts on number of tags, slightly different because it's a computed value
		// var subjectTagsSortDesc = init.common.makePourOverSortByLength('subject_tags'),
		// 		impactTagsSortDesc = init.common.makePourOverSortByLength('impact_tags');


		// var timestamp_sort_desc = new timestampSortDesc('timestamp_desc'),
		// 		pageviews_sort_desc = new pageviewsSortDesc('pageviews_desc'),

		// 		twitter_mentions_sort_desc = new twitterMentionsSortDesc('twitter_mentions_desc'),
		// 		facebook_likes_sort_desc = new facebookLikesSortDesc('facebook_likes_desc'),
		// 		avg_time_on_page_sort_desc = new avgTimeOnPageSortDesc('avg_time_on_page_desc'),
		// 		per_internal_sort_desc = new perInternalSortDesc('per_internal_desc'),
		// 		per_external_sort_desc = new perExternalSortDesc('per_external_desc'),

		// 		subject_tags_sort_desc = new subjectTagsSortDesc('subject_tags_desc'),
		// 		impact_tags_sort_desc = new impactTagsSortDesc('impact_tags_desc');

		

		// // // Save this to use later
		// this.po.sorts.timestamp_desc = new timestampSortDesc('timestamp_desc2');

		// this.po.article_summaries.addSorts([timestamp_sort_desc, pageviews_sort_desc,twitter_mentions_sort_desc,facebook_likes_sort_desc,avg_time_on_page_sort_desc,per_internal_sort_desc,per_external_sort_desc,subject_tags_sort_desc,impact_tags_sort_desc]);

		// Article summaries
		this.article_summaries.instance = new this.article_summaries.Collection(pageData.articleSummariesInfo.content_items);
		this.article_summaries.instance.metadata('pagination', pageData.articleSummariesInfo.pagination);
		this.article_summaries.instance.metadata('total', pageData.articleSummariesInfo.total);

		// // This will populate the grid view based on our selection
		this.article_comparisons.instance = new this.article_comparisons.Collection([]);
		collections.article_comparisons.instance.metadata('sort_by', pageData.dimensionsInfo.sort_by);
		collections.article_comparisons.instance.metadata('sort_ascending', pageData.dimensionsInfo.sort_ascending);

		// Articles Detail
		// This is a collection of all our fetched detailed models
		this.articles_detailed.instance = new this.articles_detailed.Collection();
		// This will choose the article to show in the detail view
		this.article_detailed.instance = new this.article_detailed.Collection();
		// What should its default viewing tab be?
		// TODO, also set this on initialize
		this.article_detailed.instance.metadata('selected-tab', 'life');
		// Tags
		// This is the collection of subject tags to be populated for each article detail page
		this.article_detailed_subject_tags.instance = new this.article_detailed_subject_tags.Collection();
		// And impact tags
		this.article_detailed_impact_tags.instance = new this.article_detailed_impact_tags.Collection();
		// Similarly, a list of impact tag categories
		this.article_detailed_impact_tag_attributes.categories_instance = new this.article_detailed_impact_tag_attributes.Collection();
		this.article_detailed_impact_tag_attributes.categories_instance.metadata('which', 'categories');
		// And even more similarly, a list of impact tag levels
		this.article_detailed_impact_tag_attributes.levels_instance = new this.article_detailed_impact_tag_attributes.Collection();
		this.article_detailed_impact_tag_attributes.levels_instance.metadata('which', 'levels');
	},
	"approval-river": function(){
		// Recipes
		// Make a collection of the recipes in this account
		var manual_recipe = {id: -1, name: 'Manually created', event_counts: {pending: pageData.manualEventsTotal}, sous_chef: 'manual-event', created: new Date().toString()};
		pageData.recipes.push(manual_recipe);
		this.recipes.instance = new this.recipes.Collection(pageData.recipes);
		// Recipes creators
		this.sous_chefs.instance = new this.sous_chefs.Collection(pageData.sousChefs);

		// This will later populate based on our selection of drawer items
		this.loaded_alerts.recipe_all_instance = new this.loaded_alerts.Collection(pageData.eventsInfo.events);
		this.loaded_alerts.recipe_all_instance.metadata('pagination', pageData.eventsInfo.pagination);
		this.loaded_alerts.recipe_all_instance.metadata('total', pageData.eventsInfo.total);

		// this.loaded_alerts.main_river_instance = new this.loaded_alerts.Collection(pageData.eventsInfo.events);
		this.active_alerts.instance = new this.active_alerts.Collection([]);

		// // // Keep track of the oldest item in this collection
		// this.loaded_alerts.instance.metadata('timestamp', pageData.alerts.min_timestamp);
	},
	settings: function(){
		// User and org settings
		this.user_settings.instance = new this.user_settings.Collection([pageData.user]);
		this.settings.instance = new this.settings.Collection(pageData.orgSettingsList);

		// Recipes
		this.recipes.instance = new this.recipes.Collection(pageData.recipes.all);

		// Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.tags.subject);
		this.impact_tags.instance  = new this.impact_tags.Collection(pageData.tags.impact);
	}
}

app.init = {
	articles: function(){

		this.instance = new this.Articles();
	},
	"approval-river": function(){

		// views.po.alerts = new PourOver.View('alerts', collections.po.alerts, {page_size: page_size });
		// views.po.alerts.setSort('timestamp_desc');

		this.instance = new this.ApprovalRiver();//({model: new models.generic.Model });
	},
	settings: function(){
		this.defaults = pageData.defaultRecipeNames;

		this.instance = new this.Settings();//({model: models.org.instance});
	}
}


routing.init = {
	go: function(section){
		this.router = new this.Router(section); // Pass the section to the `initialize` function, which will then call our sections specific routes
		Backbone.history.start();
	},
	common: function(){
		// If we've specified a starting route, then set it and trigger
		if (this.starting_route) {
			this.route('', function(){ 
				routing.router.navigate(this.starting_route, {trigger: true});
			});
		}
	},
	articles: function(){
		this.route(':mode', 'setModeOnly');
		this.route('compare/:ids', 'compareArticles');
		this.route('detail/:id', 'detailArticle');
		this.starting_route = 'compare';
	},
	"approval-river": function(){
		this.route(':mode', 'setModeOnly');
		this.route(':mode/:id', 'loadRecipesAlerts');
		this.starting_route = 'my-recipes';
	},
	settings: function(){
		// Nothing to see here folks, this page doesn't have any navigation
	}
}

var init = {
	common: {
	},
	go: function(){
		// this.jQueryExtensions()
		// Call the page specific functions
		var section = $('body').attr('data-section');
		// Their `this` should be the root object so you can still say `this.` even though you're nested in the object
		templates.init[section].call(templates);
		models.init[section].call(models);
		collections.init[section].call(collections);
		app.init[section].call(app);
		routing.init.go.call(routing, section);
	}

}

init.go();
