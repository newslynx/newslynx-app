(function(){

	var org =	 {
		"user_name": "ProPalpatine",
		"password": "",
		"api_key":"",
		"org_id": "propalpatine",
		"homepage": "http://www.propalpatine.org/",
		"short_urls": [
			 "propalp.tn"
		 ],
		"rss_feeds": [
			"http://feeds.propalpatine.org/propublica/main?format=xml"
			],
		"twitter_accounts": [
			"ProPalpatine"
			],
		"twitter_staff_list": [
			{"owner": "ProPalpatine", "slug": "propalpatine-staff"},
			],
		"facebook_accounts": [
			"propalpatine"
			],
		"youtube_accounts": [
			],
		"tumblr_accounts": [
			"propalpatine",
			"jedissay"
			],
			"google_alerts": [	 
			 "http://www.google.com/alerts/feeds/14752688329844321840/4874425503898649357",
			],
		"twitter_auth": "",
		"facebook_auth": "",
		"google_auth": "",
		"tags": [
			{ "name": "tag 1", "count": 5, "color": "#0cf" },
			{ "name": "tag 2", "count": 3, "color": "#fc0" },
			{ "name": "tag 3", "count": 1, "color": "#c0f" },
			{ "name": "tag 4", "count": 1, "color": "#0fc" },
			{ "name": "tag 5", "count": 0, "color": "#f0c" }
		]
	}

	var articles = [
		{
			"pub_date": "2014-06-13",
			"headline": "Senates vote overwhelmingly favors Empire",
			"author": "Darth Sidious",
			"tags": ["tag 1", "tag 2"],
			"pageviews": 1000,
			"fb_shares": 500,
			"fb_likes": 2000,
			"twitter_mentions": 750
		},
		{
			"pub_date": "2014-06-10",
			"headline": "Naboo deal folds",
			"author": "Darth Sidious",
			"tags": ["tag 2", "tag 3"],
			"pageviews": 300,
			"fb_shares": 100,
			"fb_likes": 1000,
			"twitter_mentions": 5000
		},
		{
			"pub_date": "2014-05-10",
			"headline": "Much promise for new Senate",
			"author": "Tarsus Valorum",
			"tags": ["tag 1", "tag 4"],
			"pageviews": 8000,
			"fb_shares": 200,
			"fb_likes": 500,
			"twitter_mentions": 4000
		}
	]

	var helpers = {
		toggle: function(key){
			console.log(!this.get(key))
			this.set(key, !this.get(key))
		},
		getTrue: function(key){
			var obj = {};
			obj[key] = true;
			return this.where(obj);
		}
	}

	var templates = {
		tagFactory: _.template( $('#tag-templ').html() ),
		articleSummaryFactory: _.template( $('#article-summary-templ').html() )
	}

	var models = {
		init: function(){
			// Tags
			org.tags.forEach(function(tag){
				var tag_model = new models.tags.Model(tag);
				models.tags.instances.push(tag_model);
			});
			// Article summaries
			articles.forEach(function(article){
				var article_model = new models.article_summary.Model(article);
				models.article_summary.instances.push(article_model);
			});
		},
		tags: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					active: false
				},
				toggle: helpers.toggle
			})
		},
		article_summary: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					detailLoaded: false,
					active: false
				},
				toggle: helpers.toggle
			})
		}
	}

	var collections = {
		init: function(){
			this.tags.instance = new this.tags.Collection(models.tags.instances);
			this.article_summaries.instance = new this.tags.Collection(models.article_summary.instances);
		},
		tags: {
			"instance": null,
			"Collection": Backbone.Collection.extend({

				model: models.tags.Tag,

				getTrue: helpers.getTrue

			})
		},
		article_summaries: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.ArticleSummary,
				getTrue: helpers.getTrue
			})
		}
	}

	var views = {
		init: function(){
			this.app = new this.App();
		},
		App: Backbone.View.extend({
			el: '#main-wrapper',

			initialize: function(){

				// Cache these selectors
				this.$tagList = $('#tag-list');
				this.$articleList = $('#article-list');

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:active', this.filterByTag);
				this.listenTo(collections.article_summaries.instance, 'change:active', this.viewArticle);

				// Create views for every one of the models in the
				// collection and add them to the page
				this.bake();
			},

			bake: function(){
				// Tags
				collections.tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$tagList.append(tag_view.render().el);
				}, this);	// "this" is the context in the callback

				// Article list
				collections.article_summaries.instance.each(function(article){
					var article_view = new views.ArticleSummary({model: article});
					this.$articleList.append(article_view.render().el);
				}, this);

				return this;
			},

			filterByTag: function(clickedModel){

				// Calculate the total order amount by agregating
				// the prices of only the checked elements
				var active_tags = collections.tags.instance.getTrue('active');

				// TODO, do filtering articles based on active tags
				console.log(active_tags);

				return this;
			},

			viewArticle: function(clickedArticle){
				console.log('viewing',this,clickedArticle)
				return this;
			}
		}),
		Tag: Backbone.View.extend({

			template: templates.tagFactory,

			tagName: 'li',

			className: 'tag-wrapper',

			events: {
				click: 'toggle'
			},

			initialize: function(){
				this.listenTo(this.model, 'change', this.styleLayout);
			},

			render: function(){
				var tag_markup = this.template( this.model.toJSON() );

				this.$el.html(tag_markup);
				// Set its border left color to the appropriate color value in its data
				this.styleLayout();
				return this;
			},

			styleLayout: function(){
				this.$el.find('.tag-container')
								.css('border-left-color', this.model.get('color'))

				// If this is active
				// Give it an active class
				// And set its background color to the one defined in its model
				if (this.model.get('active')){
					this.$el.addClass('active')
									.find('.tag-container')
									.css('background-color', this.model.get('color'));
				} else {
					this.$el.removeClass('active')
									.find('.tag-container')
									.css('background-color', 'auto');
				}

				return this
			},

			toggle: function(){
				this.model.toggle('active');
				return this;
			}
		}),
		ArticleSummary: Backbone.View.extend({

			template: templates.articleSummaryFactory,

			tagName: 'li',

			className: 'article-summary-wrapper',

			events: {
				click: 'toggle'
			},
			initialize: function(){
				this.listenTo(this.model, 'change', this.styleLayout);
			},

			render: function(){
				var article_summary_markup = this.template( this.model.toJSON() );
				this.$el.html(article_summary_markup);

				this.styleLayout();
				return this;
			},

			styleLayout: function(){
				this.$el.toggleClass('active');

				return this;
			},

			toggle: function(){
				this.model.toggle('active');
				return this;
			}
		})
	}

	var listeners = {
		general: function(){
			// Kill all links on active elements
			$('.active a').on('click', function(e){
				e.preventDefault();
			})
		}
	}

	var init = {
		go: function(){
			models.init();
			collections.init();
			views.init();
			listeners.general();

			// layout.tags.bake();
		}
	}

	init.go();

}).call(this);
