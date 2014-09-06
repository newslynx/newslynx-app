// var load = {
// 	summaries: {
// 		next: function(amount){
// 			amount = amount || 20; // TK default amount to lazy load next article by
// 		},
// 		by: {
// 			tag: function(){
// 				// Calculate the total order amount by agregating
// 				// the prices of only the checked elements
// 				var active_tags = collections.tags.instance.getTrue('active');

// 				// TODO, do filtering articles based on active tags
// 				return active_tags;
// 			},
// 			text: function(){
// 				// TODO
// 			}
// 		}
// 	},
// 	article: function(articleModel){
// 	}
// }


templates.init = {
	articles: function(){
		this.tagFactory = _.template( $('#tag-templ').html() );
		this.articleSummaryDrawerFactory = _.template( $('#article-summary-drawer-templ').html() );
		this.drawerPointers = $('#drawer-pointers-templ').html();
		this.articleGridContainerMarkup = $('#article-grid-container-templ').html();
		this.articleSummaryRowFactory = _.template( $('#article-summary-row-templ').html() );
		// this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
	},
	"approval-river": function(){
		this.recipeFactory 								= _.template( $('#recipe-templ').html() );
		this.recipeSchemaListItemFactory 	= _.template( $('#recipe-schema-list-item-templ').html() );
		this.recipeSchemaFormFactory		 	= _.template( $('#recipe-schema-form-templ').html() );
		this.alertFactory 								= _.template( $('#alert-templ').html() );

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
		this.section_mode.set('mode', 'my-recipes');
		this.all_alerts.instance = new this.all_alerts.Model;
	},
	settings: function(){
		this.org.instance = new this.org.Model(pageData.org);
	}
}

collections.init = {
	articles: function(){
		// Subject Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.subject_tags);
		// Impact tag categories
		this.tag_attribute.categories_instance = new this.tag_attribute.Collection(pageData.impact_tag_categories);
		this.tag_attribute.levels_instance = new this.tag_attribute.Collection(pageData.impact_tag_levels);
		// These meta fields are used on click to determine the filter to be applied
		// They are set on initialize for the subject and impact tag collections but since these attributes share a collection, we're setting the vals here
		// TODO, the more consistent way is to make tag_attribute two separate collection classes but I don't like making SO many of those it seems ridiculous.
		this.tag_attribute.categories_instance.metadata('filter', 'impact_tag_categories');
		this.tag_attribute.levels_instance.metadata('filter', 'impact_tag_levels');
		// Impact ags
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.impact_tags);

		// Pourover collections
		this.po.article_summaries = new PourOver.Collection(pageData.articleSummaries);
		// Make filters
		// TODO, figure out date range and headline filters
		var subject_tag_ids 					= pageData.subject_tags.map(function(subject_tag){ return subject_tag.id }),
				impact_tag_ids 						= pageData.impact_tags.map(function(impact_tag){ return impact_tag.id }),
				impact_tag_category_names = pageData.impact_tag_categories.map(function(impact_tag_category){ return impact_tag_category.name.toLowerCase(); }),
				impact_tag_level_names 		= pageData.impact_tag_levels.map(function(impact_tag_level){ return impact_tag_level.name.toLowerCase(); });

		var subject_tags_filter 				= PourOver.makeInclusionFilter("subject_tags", subject_tag_ids),
				impact_tags_filter  				= PourOver.makeInclusionFilter("impact_tags", impact_tag_ids),
				impact_tag_category_filter 	= PourOver.makeInclusionFilter("impact_tag_categories", impact_tag_category_names),
				impact_tag_level_filter 		= PourOver.makeInclusionFilter("impact_tag_levels", impact_tag_level_names);

		this.po.article_summaries.addFilters([subject_tags_filter, impact_tags_filter, impact_tag_category_filter, impact_tag_level_filter ]);


		// Article summaries
		this.article_summaries.instance = new this.article_summaries.Collection(pageData.articleSummaries);
		console.log(this.article_summaries.instance.pluck('timestamp'))
		// // This will populate the grid view based on our selection
		this.article_comparisons.instance = new this.article_comparisons.Collection([]);

		// // Article summaries
		// this.article_detaileds.instance = new this.article_detaileds.Collection([]);
		// // This will choose the article to show in the detail view
		// this.active_detail_article.instance = new this.active_detail_article.Collection([]);
	},
	"approval-river": function(){
		// Recipes
		// Make a collection of the recipes in this account
		this.recipes.instance = new this.recipes.Collection(pageData.accountRecipes);
		// Recipes creators
		this.recipes.schemas_instance = new this.recipes.Collection(pageData.recipeSchemas);

		// This will populate based on our selection of drawer items
		this.active_alerts.instance = new this.active_alerts.Collection([]);

		// Make a collection that holds all our data
		this.all_alerts.instance = new this.all_alerts.Collection(pageData.alerts.results);
		// Keep track of the oldest item in this collection
		this.all_alerts.instance.metadata('timestamp', pageData.alerts.min_timestamp);
	},
	settings: function(){
		// Nothing to see here folks
	}
}

app.init = {
	articles: function(){
		views.po.article_summaries = new PourOver.View('default_view', collections.po.article_summaries);
		this.instance = new this.Articles;
	},
	"approval-river": function(){
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
		this.starting_route = 'compare';
	},
	"approval-river": function(){
		this.route(':mode', 'loadAllInSection');
		this.route(':mode/:id', 'loadRecipe');
		this.starting_route = 'my-recipes';
	},
	settings: function(){
		// Nothing to see here folks, this page doesn't have any navigation
	}
}

var init = {
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
	}//,
	// jQueryExtensions: function(){
	// 	// Easing
	// 	$.extend(jQuery.easing,
	// 		{
	// 			easeOutCubic: function (t, b, c, d) {
	// 				t /= d;
	// 				t--;
	// 				return c*(t*t*t + 1) + b;
	// 			},
	// 			easeOutQuart: function (t, b, c, d) {
	// 				t /= d;
	// 				t--;
	// 				return -c*(t*t*t*t - 1) + b;
	// 			},
	// 			easeOutQuint: function (t, b, c, d) {
	// 				t /= d;
	// 				t--;
	// 				return c*(t*t*t*t*t + 1) + b;
	// 			}
	// 		}
	// 	)
	// }
}

init.go();
