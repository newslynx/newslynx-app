views.SettingRssFeed = views.AA_BaseSettingListItemRecipe.extend({

	default_model_opts: {
		sous_chef: 'rss-feed-to-article',
		name: 'rss_feed_recipe_name'
	},

	initialize: function(options){

		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVals(['options[feed_url]']);

		// Do some post initialization setup
		this.postRender();

		return this;
	}

});