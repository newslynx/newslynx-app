templates.init = {
	articles: function(){
		this.tagFactory = _.template( $('#tag-templ').html() );
		this.articleSummaryDrawerFactory = _.template( $('#article-summary-drawer-templ').html() );
		this.drawerPointers = $('#drawer-pointers-templ').html();
		this.articleGridContainerMarkup = $('#article-grid-container-templ').html();
		this.articleSummaryRowFactory = _.template( $('#article-summary-row-templ').html() );
		this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
		this.articleDetailTagFactory = _.template( $('#article-detail-tag-templ').html() );
		this.articleDetailAccountSubjectTagFactory = _.template( $('#article-detail-account-subject-tag-templ').html() );
	},
	"approval-river": function(){
		this.showAllRecipesFactory = _.template( $('#drawer-my-recipes-templ').html() );
		this.alertFactory 								= _.template( $('#alert-templ').html() );
		this.recipeFactory 								= _.template( $('#recipe-templ').html() );
		// this.recipeSchemaListItemFactory 	= _.template( $('#recipe-schema-list-item-templ').html() );
		// this.recipeSchemaFormFactory		 	= _.template( $('#recipe-schema-form-templ').html() );

	},
	settings: function(){
		this.settingsFactory = _.template( $('#settings-templ').html() );
		this.impactTagInputFactory = _.template( $('#impact-tag-input-templ').html() );
		this.multiInputFactory = _.template( $('#multi-input-templ').html() );
		this.multiInputDoubleFactory = _.template( $('#multi-input-double-templ').html() );
	}
}

models.init = {
	articles: function(){
		// Keep track of whether we're in single view or comparison view
		this.section_mode = new models.section_mode.Model;
		// Create some information on this model
		this.section_mode.compare = {};
	},
	"approval-river": function(){
		// Keep track of whether we're in `my-recipes or 'create-new' view
		this.section_mode = new models.section_mode.Model;
		// this.all_alerts.instance = new this.all_alerts.Model;
	},
	settings: function(){
		this.org.instance = new this.org.Model(pageData.org);
		// TODO, break this up into collections of settings like so
		// this.subject_tags.instance = new this.subject_tags.Collection(pageData.subject_tags);
		// this.subject_tags.instance.url = '/api/tags/subjects';
	}
}

collections.init = {
	articles: function(){
		// Subject Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.subject_tags);

		// Impact tags
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.impact_tags);
		// Impact tag categories
		this.impact_tag_attributes.categories_instance = new this.impact_tag_attributes.Collection(pageData.impact_tag_categories);
		this.impact_tag_attributes.levels_instance = new this.impact_tag_attributes.Collection(pageData.impact_tag_levels);
		// These meta fields are used on click to determine the filter to be applied
		// They are set on initialize for the subject and impact tag collections but since these attributes share a collection, we're setting the vals here
		// TODO, the more consistent way is to make impact_tag_attributes two separate collection classes but I don't like making SO many of those it seems ridiculous.
		// For subject_tags and impact_tags, this is set on the class
		this.impact_tag_attributes.categories_instance.metadata('filter', 'impact_tag_categories');
		this.impact_tag_attributes.levels_instance.metadata('filter', 'impact_tag_levels');
		// Because tags view instances can apply to both summary drawer filtering and event filtering
		// Stash a variable here to set up which `collections.po` collection to alter
		// `collections.po.article_summaries` or `collections.po.article_detailed_events`
		this.subject_tags.instance.metadata('po_collection', 'article_summaries');
		this.impact_tags.instance.metadata('po_collection', 'article_summaries');
		this.impact_tag_attributes.categories_instance.metadata('po_collection', 'article_summaries');
		this.impact_tag_attributes.levels_instance.metadata('po_collection', 'article_summaries');


		// Pourover collections
		this.po.article_summaries = new PourOver.Collection(pageData.articleSummaries);
		// Make filters
		var subject_tag_ids 					= pageData.subject_tags.map(function(subject_tag){ return subject_tag.id }),
				impact_tag_ids 						= pageData.impact_tags.map(function(impact_tag){ return impact_tag.id }),
				impact_tag_category_names = pageData.impact_tag_categories.map(function(impact_tag_category){ return impact_tag_category.name; }),
				impact_tag_level_names 		= pageData.impact_tag_levels.map(function(impact_tag_level){ return impact_tag_level.name; });

		var subject_tags_filter 				= PourOver.makeInclusionFilter('subject_tags', subject_tag_ids),
				impact_tags_filter  				= PourOver.makeInclusionFilter('impact_tags', impact_tag_ids),
				impact_tag_category_filter 	= PourOver.makeInclusionFilter('impact_tag_categories', impact_tag_category_names),
				impact_tag_level_filter 		= PourOver.makeInclusionFilter('impact_tag_levels', impact_tag_level_names);


		// We'll populate this with cids from our text inputting via Bloodhound
		var text_search_filter = PourOver.makeManualFilter('title');

		// Timestamp filter, which will be triggered from the UI via Pikaday
		var timestamp_filter = PourOver.makeContinuousRangeFilter("timestamp", {attr: "timestamp"})

		// Save some of these filters for later
		// Like when we filter events by these 
		this.po.filters = {
			impact_tags: impact_tags_filter,
			impact_tag_categories: impact_tag_category_filter,
			impact_tag_levels: impact_tag_level_filter,
			timestamps: timestamp_filter
		};

		this.po.article_summaries.addFilters([subject_tags_filter, impact_tags_filter, impact_tag_category_filter, impact_tag_level_filter, text_search_filter, timestamp_filter]);

		// Create a bunch of sorts
		var timestampSortDesc = init.common.makePourOverSort('timestamp'),
				pageviewsSortDesc = init.common.makePourOverSort('pageviews'),
				twitterMentionsSortDesc = init.common.makePourOverSort('twitter'),
				facebookLikesSortDesc = init.common.makePourOverSort('facebook'),
				avgTimeOnPageSortDesc = init.common.makePourOverSort('avg_time_on_page'),
				internalSortDesc = init.common.makePourOverSort('internal'),
				externalSortDesc = init.common.makePourOverSort('external');

		// Create sorts on number of tags, slightly different because it's a computed value
		var subjectTagsSortDesc = init.common.makePourOverSortByLength('subject_tags'),
				impactTagsSortDesc = init.common.makePourOverSortByLength('impact_tags');


		var timestamp_sort_desc = new timestampSortDesc('timestamp_desc'),
				pageviews_sort_desc = new pageviewsSortDesc('pageviews_desc'),

				twitter_mentions_sort_desc = new twitterMentionsSortDesc('twitter_mentions_desc'),
				facebook_likes_sort_desc = new facebookLikesSortDesc('facebook_likes_desc'),
				avg_time_on_page_sort_desc = new avgTimeOnPageSortDesc('avg_time_on_page_desc'),
				internal_sort_desc = new internalSortDesc('internal_desc'),
				external_sort_desc = new externalSortDesc('external_desc'),

				subject_tags_sort_desc = new subjectTagsSortDesc('subject_tags_desc'),
				impact_tags_sort_desc = new impactTagsSortDesc('impact_tags_desc');

		

		// // Save this to use later
		this.po.sorts.timestamp_desc = new timestampSortDesc('timestamp_desc2');

		this.po.article_summaries.addSorts([timestamp_sort_desc, pageviews_sort_desc,twitter_mentions_sort_desc,facebook_likes_sort_desc,avg_time_on_page_sort_desc,internal_sort_desc,external_sort_desc,subject_tags_sort_desc,impact_tags_sort_desc]);

		// Article summaries
		this.article_summaries.instance = new this.article_summaries.Collection;

		// // This will populate the grid view based on our selection
		this.article_comparisons.instance = new this.article_comparisons.Collection([]);

		// How should the grid marker be layed out?
		collections.article_comparisons.instance.metadata('comparison-marker-dimension', 'mean');
		collections.article_comparisons.instance.metadata('comparison-marker-group', 'all');
		collections.article_comparisons.instance.metadata('comparison-marker-max', 'per97_5');
		// Articles Detail
		// This is a collection of all our fetched detailed models
		this.articles_detailed.instance = new this.articles_detailed.Collection;
		// This will choose the article to show in the detail view
		this.article_detailed.instance = new this.article_detailed.Collection;

		// Tags
		// This is the collection of subject tags to be populated for each article detail page
		this.article_detailed_subject_tags.instance = new this.article_detailed_subject_tags.Collection;
		// Similarly, a list of impact tag categories
		this.article_detailed_impact_tag_attributes.categories_instance = new this.article_detailed_impact_tag_attributes.Collection;
		this.article_detailed_impact_tag_attributes.categories_instance.metadata('which', 'categories');
		// And even more similarly, a list of impact tag levels
		this.article_detailed_impact_tag_attributes.levels_instance = new this.article_detailed_impact_tag_attributes.Collection;
		this.article_detailed_impact_tag_attributes.levels_instance.metadata('which', 'levels');
	},
	"approval-river": function(){
		// Recipes
		// Make a collection of the recipes in this account
		this.recipes.account_instance = new this.recipes.Collection(pageData.accountRecipes);
		// Recipes creators
		this.recipes.schemas_instance = new this.recipes.Collection(pageData.recipeSchemas);

		// This will populate based on our selection of drawer items
		this.active_alerts.instance = new this.active_alerts.Collection([]);

		// Make a pourover collection that holds all our data
		// this.po = new this.all_alerts.Collection(pageData.alerts.results);
		// TODO, once the metadata are removed from the api response, make this just `pageData.alerts`.
		this.po.alerts = new PourOver.Collection(pageData.alerts.results);

		// Make sorts for this collection
		var timestampSortDesc = init.common.makePourOverSort('timestamp');
		var timestamp_sort_desc = new timestampSortDesc('timestamp_desc');
		
		// Add sorts
		this.po.alerts.addSorts([timestamp_sort_desc]);

		// Make filters on this collection
		// Get a list of all recipe ids
		var recipe_ids = pageData.accountRecipes.map(function(accountRecipe){ return accountRecipe.id; });

		// Turn that into a pourover filter
		var recipe_id_filter = PourOver.makeExactFilter('recipe_id', recipe_ids);
		// And add it to our collection
		this.po.alerts.addFilters([recipe_id_filter]);

		// // Keep track of the oldest item in this collection
		// this.all_alerts.instance.metadata('timestamp', pageData.alerts.min_timestamp);
	},
	settings: function(){
		// Nothing to see here folks
	}
}

app.init = {
	articles: function(){
		var page_size = 20;
		views.po.article_summaries = new PourOver.View('default_view', collections.po.article_summaries, {page_size: page_size });
		views.po.article_summaries.setSort('timestamp_desc');

		// Set how we want the comparison view to sort
		// If PourOver took asc and desc bools we could more easily link these
		collections.article_comparisons.instance.metadata('sort_by', 'timestamp');
		collections.article_comparisons.instance.metadata('sort_ascending', false);

		var summaries_page_one = views.po.article_summaries.getCurrentItems();

		// This will cascade down such that these articles will be added to the comparison on load
		// By setting this here and not above, we ensure that the first n articles in our sorted view get added
		summaries_page_one.forEach(function(summary){
			summary['selected_for_compare'] = true;
		});

		// Grab everything and store it
		// We'll feed this to Bloodhound
		// Grab a list of all cids to pass when we want to 
		var all_articles = collections.po.article_summaries.items,
				all_cids  = _.pluck(all_articles, 'cid');
		views.po.article_summaries.all_cids = all_cids;

		if (all_articles.length){
			this.bloodhound = new Bloodhound({
					name: 'articles',
					local: all_articles,
					datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
					queryTokenizer: Bloodhound.tokenizers.whitespace
			});

			// Release the hound(s)
			this.bloodhound.initialize();
		}

		this.instance = new this.Articles;
		// Set the collection to the models in our view
		views.po.article_summaries.trigger('update');
	},
	"approval-river": function(){
		var page_size = 50;
		var all_articles = pageData.articleSkeletons;

		if (all_articles.length){
			this.bloodhound = new Bloodhound({
					name: 'articles',
					local: all_articles,
					datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
					queryTokenizer: Bloodhound.tokenizers.whitespace
			});

			// Release the hound(s)
			this.bloodhound.initialize();
		}

		views.po.alerts = new PourOver.View('alerts', collections.po.alerts, {page_size: page_size });
		views.po.alerts.setSort('timestamp_desc');

		this.instance = new this.ApprovalRiver({model: new models.app.Model });
	},
	settings: function(){
		this.instance = new this.Settings({model: models.org.instance});
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
				routing.router.navigate(this.starting_route, {trigger: true}) 
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
		makePourOverSort: function(key){
			return PourOver.Sort.extend({
					attr: key,
					fn: function(a,b){
						if (a[key] > b[key]){
							return -1;
						} else if (a[key] < b[key]){
							return 1;
						} else {
							return 0;
						}
					}
				});
		},
		makePourOverSortByLength: function(key){
			return PourOver.Sort.extend({
					attr: 'uqbar', // Change if PourOver ever makes this property meaningful
					fn: function(a,b){
						if (a[key].length > b[key].length){
							return -1;
						} else if (a[key].length < b[key].length){
							return 1;
						} else {
							return 0;
						}
					}
				});
		}
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
