routing = {
	Router: Backbone.Router.extend({
		initialize: function(section){
			// Stash an array of history states
			this.history = [];
			this.listenTo(this, 'route', function (name, args) {
				// For some reason, a second event is triggered where args is undefined, it could be a replacement call or something
				// For now, just ignore when undefined, when it's empty it's null
				if (!_.isUndefined(args[1])){
					this.history.push({
						name : name,
						mode : args[0],
						ids : args[1],
						fragment : Backbone.history.fragment
					});
				}
			});

			// Initialize the routes for this section
			routing.init[section].call(this);
			// And any common routes we want for every page
			routing.init.common.call(this);
		},
		loadRecipesAlerts: function(mode, recipe_id){
			if (recipe_id == 'manual'){
				recipe_id = -1;
			}
			recipe_id = +recipe_id;
			// `setModeOnly` is set to initialize the show all view of the recipe
			// We're going to trigger that manually right afterwards so we have this hacky variable to tell `ApprovalRiver.js` not to initialize the show all filter
			app.instance.pause_init = true;
			this.setModeOnly(mode);
			collections.recipes.instance.findWhere({id: recipe_id}).trigger('filter');
		},
		setModeOnly: function(mode){
			models.section_mode.set('mode', mode);
		},
		compareArticles: function(ids, sortBy, sortAscending){
			// Don't load the initial values
			app.instance.pause_init = true;

			var is_compare_mode = (models.section_mode.get('mode') == 'compare');

			ids = ids.replace(/\+/g, ',');

			sortAscending = JSON.parse(sortAscending);

			// var metrics_list = _.pluck(collections.dimensions.instance.cloneMetrics(), 'name');
			// var metric_str = (_.contains(metrics_list, sortBy)) ? 'metrics.' : '';

			var fetch_params = {
				ids: ids,
				sort_ids: true
				// sort: sort_ascending_str + metric_str + sortBy
			};

			// If already set this won't do anything
			models.section_mode.set('mode', 'compare');
			collections.article_comparisons.instance.metadata('sort_by', sortBy);
			collections.article_comparisons.instance.metadata('sort_ascending', sortAscending);
			collections.article_comparisons.instance.fetch({data: fetch_params}, {merge: true})
				.then(function(models){
					collections.article_comparisons.instance.setComparator(sortBy);
					collections.article_comparisons.instance.trigger('sortMetricHeaders');
					app.instance.staged_article_comparison_models = collections.article_comparisons.instance.slice(0);
					app.instance.pause_init = false;
				});

		},
		detailArticle: function(id){
			var is_detail_mode = (models.section_mode.get('mode') == 'detail');

			// Make sure this is a number
			id = +id;
			if (!is_detail_mode){
				app.instance.staged_article_detail = id;
				// This will trigger the rest of the view to load
				models.section_mode.set('mode', 'detail');
			} else {
				// .detail.loadPage(detailModelId, this.saveHash
				// If we're not in detail mode then setting it won't cascade those changes so we call this manually
				app.instance.detail.loadPage.call(app.instance, id, app.instance.saveHash)
				// app.instance.detail.getDetailModelFromId.call(app.instance, id, app.instance.detail.loadPage)
			}
		}

	}),
	helpers: {
		getMode: function(hash){
			return hash.split('/')[0].replace(/#/g,'');
		},
		getArticleIds: function(hash){
			// If it has a second index then it's true
			// If it's empty this will be undefined or ""
			return hash.split('/')[1];
		},
		exists: function(hash, articleId){
			var id_regex = new RegExp(articleId)
			return id_regex.test(hash);
		}
	}
}