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
		this.drawerListItemFactory = _.template( $('#article-summary-templ').html() );
		this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
		this.articleGridContainerMarkup = $('#article-grid-container-templ').html();
		this.articleDetailRowFactory = _.template( $('#article-detail-row-templ').html() );
	},
	"approval-river": function(){
		this.drawerListItemFactory = _.template( $('#recipe-templ').html() );
		this.drawerListItemStaticFactory = _.template( $('#recipe-creator-templ').html() );
		this.recipeFormFactory = _.template( $('#recipe-form-templ').html() );
		this.riverItemFactory = _.template( $('#river-item-templ').html() );

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
		this.section_mode = new (Backbone.Model.extend({}));
		this.section_mode.set('mode', 'single');
	},
	"approval-river": function(){
		// Keep track of whether we're in `my-recipes or 'create-new' view
		this.section_mode = new (Backbone.Model.extend({}));
		this.section_mode.set('mode', 'my-recipes');
	},
	settings: function(){
		this.org.instance = new this.org.Model(pageData.org);
	}
}

collections.init = {
	articles: function(){
		// Tags
		this.subject_tags.instance = new this.subject_tags.Collection(pageData.org.subject_tags);
		this.impact_tags.instance = new this.impact_tags.Collection(pageData.org.impact_tags);
		// Article summaries
		this.drawer_items.instance = new this.drawer_items.Collection( pageData.articleSummaries );
		// This will populate based on our selection
		this.row_items.instance = new this.row_items.Collection([]);
		// This will also populate based on our selection
		this.detail_items.instance = new this.detail_items.Collection([]);
	},
	"approval-river": function(){
		// Recipes
		this.drawer_items.instance = new this.drawer_items.Collection(pageData.accountRecipes);
		this.drawer_items.instance.url = '/api/recipes';
		// Recipes creators
		this.drawer_items.instance_static = new this.drawer_items.Collection(pageData.recipeSchemas);
		// This will populate based on our selection of drawer items
		this.detail_items.instance = new this.detail_items.Collection([]);
	},
	settings: function(){
		// Nothing to see here folks
	}
}

app.init = {
	articles: function(){
		this.instance = new this.Articles();
	},
	"approval-river": function(){
		this.instance = new this.ApprovalRiver();
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
		this.route(':mode/:uid', 'readPage');
		// If we've specified a starting route, then set it and trigger
		if (this.starting_route) this.route('', function(){ routing.router.navigate(this.starting_route, {trigger: true}) });
	},
	articles: function(){
		this.route(':mode(/)', 'stripTrailingSlash');
		this.starting_route = 'compare/'+app.helpers.drawer.getAllUids.call(app.instance).join('&');
	},
	"approval-river": function(){
		this.route(':mode(/)', 'readPage');
		this.starting_route = 'my-recipes/all';
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
