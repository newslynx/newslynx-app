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
			"article_uid": "a1",
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
			"article_uid": "a2",
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
			"article_uid": "a3",
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
		    "org_id": "propalpatine",
		    "article_url": "http://www.propalpatine.org/article/Senators-vote-Empire",
		    "article_uid": "a1",
		    "article_img": "Eec4oRk2Ey3wEc4Am7eecK3riA8Wri",
		    "title": "Senators vote overwhelmingly in favor of Empire",
		    "authors": [
		        "Darth Sidious"
		    ],
		    "nl_desc": "Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance.",
		    "pub_datetime": "2014-06-13",
		    "series_ids": [
		        "fracking"
		    ],
		    "aggregate_stats": {
		        "internal_twitter_shares": 2,
		        "internal_twitter_ids": [
		            "123456678910",
		            "123456678911"
		        ],
		        "internal_facebook_likes": 1,
		        "internal_facebook_post_ids": [
		            "123456678910"
		        ],
		        "internal_tumblr_posts": 0,
		        "internal_tumblr_post_ids": [],
		        "time_on_homepage": 1000,
		        "twitter_shares": 123,
		        "facebook_likes": 123,
		        "tumblr_likes": 123,
		        "tumblr_reposts": 123,
		        "pageviews": 123,
		        "avg_time": 100,
		        "bounce_rate": 0.95,
		        "days_since_publication": 6,
		        "num_refers": 1,
		        "refer_urls": [
		            "http://example.com/"
		        ],
		        "n_events": 1
		    },
		    "timeseries_stats": [
		        {
		            "datetime": "2014-01-04 13:00:00",
		            "internal_twitter_shares": 2,
		            "internal_twitter_ids": [
		                "123456678910",
		                "123456678911"
		            ],
		            "internal_facebook_likes": 1,
		            "internal_facebook_post_ids": [
		                "123456678910"
		            ],
		            "internal_tumblr_posts": 0,
		            "internal_tumblr_post_ids": [],
		            "on_home_page": 1,
		            "twitter_shares": 123,
		            "facebook_likes": 123,
		            "tumblr_likes": 123,
		            "tumblr_reposts": 123,
		            "pageviews": 123,
		            "avg_time": 100,
		            "bounce_rate": 0.95,
		            "days_since_publication": 6,
		            "num_refers": 1,
		            "refer_urls": [
		                "http://example.com/"
		            ],
		            "events": [
		                {
		                    "type": "mention",
		                    "metadata": "TK"
		                }
		            ]
		        }
		    ],
		    "events": [
		        {
		            "type": "mention",
		            "datetime": "2014-01-04 13:00:00",
		            "metadata": "TK"
		        }
		    ]
		},{
		    "org_id": "propalpatine",
		    "article_url": "http://www.propalpatine.org/article/Naboo-deal-folds",
		    "article_uid": "a2",
		    "article_img": "Eec4oRk2Ey3wEc4Am7eecK3riA8Wri",
		    "title": "Naboo deal folds",
		    "authors": [
		        "Darth Sidious"
		    ],
		    "nl_desc": "Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance.",
		    "pub_datetime": "2014-06-10",
		    "series_ids": [
		        "fracking"
		    ],
		    "aggregate_stats": {
		        "internal_twitter_shares": 2,
		        "internal_twitter_ids": [
		            "123456678910",
		            "123456678911"
		        ],
		        "internal_facebook_likes": 1,
		        "internal_facebook_post_ids": [
		            "123456678910"
		        ],
		        "internal_tumblr_posts": 0,
		        "internal_tumblr_post_ids": [],
		        "time_on_homepage": 1000,
		        "twitter_shares": 123,
		        "facebook_likes": 123,
		        "tumblr_likes": 123,
		        "tumblr_reposts": 123,
		        "pageviews": 123,
		        "avg_time": 100,
		        "bounce_rate": 0.95,
		        "days_since_publication": 6,
		        "num_refers": 1,
		        "refer_urls": [
		            "http://example.com/"
		        ],
		        "n_events": 1
		    },
		    "timeseries_stats": [
		        {
		            "datetime": "2014-01-04 13:00:00",
		            "internal_twitter_shares": 2,
		            "internal_twitter_ids": [
		                "123456678910",
		                "123456678911"
		            ],
		            "internal_facebook_likes": 1,
		            "internal_facebook_post_ids": [
		                "123456678910"
		            ],
		            "internal_tumblr_posts": 0,
		            "internal_tumblr_post_ids": [],
		            "on_home_page": 1,
		            "twitter_shares": 123,
		            "facebook_likes": 123,
		            "tumblr_likes": 123,
		            "tumblr_reposts": 123,
		            "pageviews": 123,
		            "avg_time": 100,
		            "bounce_rate": 0.95,
		            "days_since_publication": 6,
		            "num_refers": 1,
		            "refer_urls": [
		                "http://example.com/"
		            ],
		            "events": [
		                {
		                    "type": "mention",
		                    "metadata": "TK"
		                }
		            ]
		        }
		    ],
		    "events": [
		        {
		            "type": "mention",
		            "datetime": "2014-01-04 13:00:00",
		            "metadata": "TK"
		        }
		    ]
		},{
		    "org_id": "propalpatine",
		    "article_url": "http://www.propalpatine.org/article/Much-promise-for-new-Senate",
		    "article_uid": "a3",
		    "article_img": "Eec4oRk2Ey3wEc4Am7eecK3riA8Wri",
		    "title": "Much promise for new Senate",
		    "authors": [
		        "Tarsus Valourm"
		    ],
		    "nl_desc": "Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance. Natural language description of article performance.",
		    "pub_datetime": "2014-05-10",
		    "series_ids": [
		        "fracking"
		    ],
		    "aggregate_stats": {
		        "internal_twitter_shares": 2,
		        "internal_twitter_ids": [
		            "123456678910",
		            "123456678911"
		        ],
		        "internal_facebook_likes": 1,
		        "internal_facebook_post_ids": [
		            "123456678910"
		        ],
		        "internal_tumblr_posts": 0,
		        "internal_tumblr_post_ids": [],
		        "time_on_homepage": 1000,
		        "twitter_shares": 123,
		        "facebook_likes": 123,
		        "tumblr_likes": 123,
		        "tumblr_reposts": 123,
		        "pageviews": 123,
		        "avg_time": 100,
		        "bounce_rate": 0.95,
		        "days_since_publication": 6,
		        "num_refers": 1,
		        "refer_urls": [
		            "http://example.com/"
		        ],
		        "n_events": 1
		    },
		    "timeseries_stats": [
		        {
		            "datetime": "2014-01-04 13:00:00",
		            "internal_twitter_shares": 2,
		            "internal_twitter_ids": [
		                "123456678910",
		                "123456678911"
		            ],
		            "internal_facebook_likes": 1,
		            "internal_facebook_post_ids": [
		                "123456678910"
		            ],
		            "internal_tumblr_posts": 0,
		            "internal_tumblr_post_ids": [],
		            "on_home_page": 1,
		            "twitter_shares": 123,
		            "facebook_likes": 123,
		            "tumblr_likes": 123,
		            "tumblr_reposts": 123,
		            "pageviews": 123,
		            "avg_time": 100,
		            "bounce_rate": 0.95,
		            "days_since_publication": 6,
		            "num_refers": 1,
		            "refer_urls": [
		                "http://example.com/"
		            ],
		            "events": [
		                {
		                    "type": "mention",
		                    "metadata": "TK"
		                }
		            ]
		        }
		    ],
		    "events": [
		        {
		            "type": "mention",
		            "datetime": "2014-01-04 13:00:00",
		            "metadata": "TK"
		        }
		    ]
		}
	]

	var templateHelpers = {
		date: function(isoDate){
			// TODO, Figure out proper timezone stuff
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
		articleSummaryFactory: _.template( $('#article-summary-templ').html() ),
		articleDetailFactory: _.template( $('#article-detail-templ').html() )
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

			// Keep track of whether we're in single view or comparison view
			models.article_mode.instance = new models.article_mode.Model();
			// A model for the full article view
			models.article_detail.instance = new models.article_detail.Model();
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
		article_mode: {
			"instance": null,
			"Model": Backbone.Model.extend({
				defaults: {
					mode: 'single'
				}
			})
		},
		article_detail: {
			"instances": null,
			"Model": Backbone.Model.extend({})
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

	var routing = {
		Router: Backbone.Router.extend({
			routes: {
				'single/:uid': 'single',
				'compare/:uids': 'compare'
			},
			single: function(uid){
				// Zero out existing active articles
				collections.article_summaries.instance.zeroOut();
				// Set the model whose uid is in the hash to a `viewing_single` property of true
				collections.article_summaries.instance.where({'article_uid': uid})[0].set({'viewing_single': true})
			},
			compare: function(uids){

			}
		}),
		init: function(){
			routing.router = new this.Router;
			Backbone.history.start();
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
				this.$articleDetail = $('#content');
				this.$divisionSwitcher = $('.division-switcher');
				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:active', this.summaryList.update);

				// The article mode is either `single` or `compare`.
				this.listenTo(models.article_mode.instance, 'change:mode', this.divisionSwitcher.update);

				// When a summary item has `viewing_single` set to true
				// Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
				this.listenTo(collections.article_summaries.instance, 'change:viewing_single', this.mainArticle.update);

				// When you change the main article's information
				// Bake it out to the main content area
				this.listenTo(models.article_detail.instance, 'change', this.mainArticle.bake);

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

				new views.DivisionSwitcher({model: models.article_mode.instance, el: this.$divisionSwitcher.find('li[data-mode="single"]')})
				new views.DivisionSwitcher({model: models.article_mode.instance, el: this.$divisionSwitcher.find('li[data-mode="compare"]')})

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
					if (is_new) this.mainArticle.fetch( articleModel.get('article_uid') );
					return this;
				},
				check: function(articleModel){
					// Returns true if this model is being viewed
					// False if it was the previously viewed model which triggered a change because we switched it its `viewing_single` prop to false
					return articleModel.get('viewing_single');
				},
				set: function(articleData){
					// Update the full article model with new data
					models.article_detail.instance.set(articleData);

				},
				fetch: function(articleUid){
					// For now, just have the fetch do the bake
					routing.router.navigate('//single/' + articleUid);
					var loaded_matches = _.filter(articles_detailed, function(obj) { return obj.article_uid === articleUid });
					if (loaded_matches.length) {
						this.set(loaded_matches[0])
					} else {
						// TODO, handle fetching to the server
						// Give the article data to `this.mainArticle.set`

					}
				},
				bake: function(detailModel){
					var article_detail_view = new views.ArticleDetail({model: detailModel});
					this.$articleDetail.html(article_detail_view.render().el);
					return this;
				}
			},
			divisionSwitcher: {
				update: function(model){
					var mode = model.get('mode');
					// Before you switch
					// Grab the current page numbers listed
					var hash_arr = current_uids = new_uids = [];

					// Only save a previous state if you have a previous article state
					if (window.location.hash && window.location.hash.split('/').length > 2){
						hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
						current_uids = hash_arr.slice(2, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
						// If we have something previously saved, used that
						// If not, our hash will just stay the same
						new_uids = model.get('previous-uids') || current_uids;
						new_uids = '/' + new_uids;
						// // If we're going into single mode and the hash hasmore than one uid, then we'll go to the first one
						if (mode == 'single' && current_uids.length > 1) new_uids = [current_uids[0]];
					}


					this.$divisionSwitcher.find('li').removeClass('active');
					this.$divisionSwitcher.find('li[data-mode="'+mode+'"]').addClass('active');

					routing.router.navigate('//'+mode+new_uids.join('&'), {trigger: true});
					// TODO, test the previous state save better once the comparison selection is working better
					model.set('previous-uids', current_uids);
					return this;
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

				return this;
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
				var mode = models.article_mode.instance.get('mode');
				// If we're in article single view mode
				// And this article is not already selected
				if (mode == 'single' && !this.model.get('viewing_single')){
					// Clear the last active article
					collections.article_summaries.instance.zeroOut();
					// And set this model to the one being viewed
					this.model.set('viewing_single', true);
				} else if (mode == 'compare') {
					console.log('here')
					this.set('viewing_comparison', true);
				}
				return this;
			}
		}),
		ArticleDetail: Backbone.View.extend({

			template: templates.articleDetailFactory,

			tagName: 'div',

			className: 'article-detail-wrapper',

			events: {
				// click: 'setActive'
			},
			initialize: function(){
				this.listenTo(this.model, 'change', this.render);
			},

			render: function(){
				var article_detail_markup = this.template( _.extend(this.model.toJSON(), templateHelpers) );
				this.$el.html(article_detail_markup);

				return this;
			}

		}),
		DivisionSwitcher: Backbone.View.extend({

			tagName: 'li',

			events: {
				click: 'setActive'
			},
			initialize: function(){
				this.listenTo(this.model, 'change', this.toggle);
			},

			setActive: function(){
				var mode = this.$el.attr('data-mode');
				// And set this model to the one being viewed
				this.model.set('mode', mode);
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
			routing.init();
			listeners.general();
		}
	}

	init.go();

}).call(this);
