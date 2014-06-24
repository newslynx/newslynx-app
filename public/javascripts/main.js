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
			"uid": "a1",
			"pub_date": "2014-06-13",
			"headline": "Senate's vote overwhelmingly favors Empire",
			"author": "Darth Sidious",
			"tags": ["tag 1", "tag 2"],
			"pageviews": 1000,
			"fb_shares": 500,
			"fb_likes": 2000,
			"twitter_mentions": 750
		},
		{
			"uid": "a2",
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
			"uid": "a3",
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

	var articles_detailed = [
		{
				"uid": "a1",
				"pub_date": "2014-06-13",
				"headline": "Senate's vote overwhelmingly favors Empire",
				"author": "Darth Sidious",
				"tags": ["tag 1", "tag 2"],
				"pageviews": 1000,
				"fb_shares": 500,
				"fb_likes": 2000,
				"twitter_mentions": 750
			},
			{
				"uid": "a2",
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
				"uid": "a3",
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

	var templateHelpers = {
		date: function(isoDate){
			// TODO, AP Style the montha abbreviations with `.` where appropriate
			var full_date_string = new Date(isoDate).toDateString(), // "2014-06-24" -> "Mon Jun 23 2014"
					month_day_year_arr = full_date_string.split(' ').slice(1,4), // Remove day of the week
					commafy = month_day_year_arr[0] + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
			return commafy.replace(' 0', ' '); // Trip leading zeros
		}
	}

	var collectionHelpers = {
		toggle: function(key){
			this.set(key, !this.get(key))
		},
		getTrue: function(key){
			var obj = {};
			obj[key] = true;
			return this.where(obj);
		},
		zeroOut: function(){
			this.getTrue('viewing_single').forEach(function(model){
				model.set('viewing_single', false);
			});
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

			models.article_state.instance = new models.article_state.Model();
		},
		tags: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					active: false
				},
				toggle: collectionHelpers.toggle
			})
		},
		article_summary: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					viewing_single: false,
					viewing_comparison: false,
				},
				toggle: collectionHelpers.toggle
			})
		},
		article_state: {
			"instance": null,
			"Model": Backbone.Model.extend({
				defaults: {
					mode: 'single'
				}
			})
		}
	}

	var collections = {
		init: function(){
			this.tags.instance = new this.tags.Collection(models.tags.instances);
			this.article_summaries.instance = new this.article_summaries.Collection(models.article_summary.instances);
			// Add a mode attribute, which will determine whether the drawer is being used in single view or compare mode
			// this.article_summaries.instance.mode = 'single';
		},
		tags: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.tags.Tag,
				getTrue: collectionHelpers.getTrue
			})
		},
		article_summaries: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.ArticleSummary,
				getTrue: collectionHelpers.getTrue,
				zeroOut: collectionHelpers.zeroOut
			})
		}
	}

	var load = {
		summaries: {
			next: function(amount){
				amount = amount || 20; // TK default amount to lazy load next article by
			},
			by: {
				tag: function(){
					// Calculate the total order amount by agregating
					// the prices of only the checked elements
					var active_tags = collections.tags.instance.getTrue('active');

					// TODO, do filtering articles based on active tags
					return active_tags;
				},
				text: function(){
					// TODO
				}
			}
		},
		article: function(articleModel){
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
				this.listenTo(collections.tags.instance, 'change:active', this.summaryList.update);
				this.listenTo(collections.article_summaries.instance, 'change:viewing_single', this.mainArticle.update);
				// this.listenTo(collections.article_summaries.instance, 'change:viewing_comparison', this.makeComparison);

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

			summaryList: {
				update: function(){
					var active_tags = load.summaries.by.tag()
					return this;

				},
				bake: function(){
					
				}
			},
			mainArticle: {
				update: function(articleModel){
					var is_new = this.mainArticle.check(articleModel);
					if (is_new) this.mainArticle.fetch(articleModel, this.mainArticle.bake);

					return this;
				},
				check: function(articleModel){
					// Returns true if this model is being viewed
					// False if it was the previously viewed model which triggered a change because we switched it its `viewing_single` prop to false
					return articleModel.get('viewing_single');
				},
				bake: function(articleData){
					console.log('baking', articleData)
				},
				fetch: function(articleModel, cb){
					// For now, just have the fetch do the bake
					var uid = articleModel.get('uid');
					var loaded_matches = _.filter(articles_detailed, function(obj) { return obj.uid === uid });
					if (loaded_matches.length) {
						cb(loaded_matches[0])
					} else {
						// TODO, handle fetching to the server
					}
				}
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
				var tag_markup = this.template( _.extend(this.model.toJSON(), templateHelpers) );

				this.$el.html(tag_markup);
				// Set its border left and bg color to the appropriate color value in its data
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
				click: 'setActive'
			},
			initialize: function(){
				this.listenTo(this.model, 'change:viewing_single', this.style.single);
			},

			render: function(){
				var article_summary_markup = this.template( _.extend(this.model.toJSON(), templateHelpers) );
				this.$el.html(article_summary_markup);

				return this;
			},

			style: {
				single: function(articleModel){
					if ( articleModel.get('viewing_single') ){
						this.$el.addClass('active');
					} else {
						this.$el.removeClass('active');
					}
					return this;
				},
				comparison: function(){

				}
			},

			setActive: function(){
				var mode = models.article_state.instance.get('mode');
				// If we're in article single view mode
				// And this article is not already selected
				if (mode == 'single' && !this.model.get('viewing_single')){
					// Clear the last active article
					collections.article_summaries.instance.zeroOut();
					// And set this model to the one being viewed
					this.model.set('viewing_single', true);
				} else if (mode == 'comparison') {
					this.set('viewing_comparison', true);
				}
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
		}
	}

	init.go();

}).call(this);
