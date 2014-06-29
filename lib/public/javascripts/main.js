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

	var articles_detailed = [{
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

	var templates = {
		init: {
			articles: function(){
				// Templates are defined here on `init.go()`
				// We can't store references to them in Backbone views under `this.template`
				// Because the `template: templates.tagFactory` line is evaluated on compilation and thus it caches an undefined function
				// We can't run the templates, however, because then errors will be thrown when other pages' templates don't exist
				// Essentially, all of our things needs to be evaluated inside function on `init.go()`, otherwise some things won't exist.
				this.tagFactory = _.template( $('#tag-templ').html() );
				this.articleSummaryFactory = _.template( $('#article-summary-templ').html() );
				this.articleDetailFactory = _.template( $('#article-detail-templ').html() );
				this.articleDetailCardFactory = _.template( $('#article-detail-card-templ').html() );
			},
			"approval-river": function(){

			}
		},
		helpers: {
			date: function(isoDate){
				// TODO, Figure out proper timezone stuff
				var full_date_string = new Date(isoDate).toDateString(), // "2014-06-24" -> "Mon Jun 23 2014"
						month_day_year_arr = full_date_string.split(' ').slice(1,4), // Remove day of the week
						commafy = month_day_year_arr[0] + ' ' + month_day_year_arr[1] + ', ' + month_day_year_arr[2];
				return commafy.replace(' 0', ' '); // Strip leading zeros
			}
		}
	}

	var modelCollectionHelpers = {
		toggle: function(key){
			this.set(key, !this.get(key));
		},
		getTrue: function(key){
			var obj = {};
			obj[key] = true;
			return this.where(obj);
		},
		zeroOut: function(key){
			this.getTrue(key).forEach(function(model){
				model.set(key, false);
			});
		}
	}

	var models = {
		init: {
			articles: function(){
				// Tags
				org.tags.forEach(function(tag){
					var tag_model = new this.tags.Model(tag);
					this.tags.instances.push(tag_model);
				}, this);

				// Article summaries
				articles.forEach(function(article){
					var article_model = new this.article_summary.Model(article);
					this.article_summary.instances.push(article_model);
				}, this);

				// Keep track of whether we're in single view or comparison view
				this.article_mode.instance = new this.article_mode.Model();
				// // A model for the full article view
				this.article_detail.instance = new this.article_detail.Model();
			},
			"approval-river": function(){

			}
		},
		tags: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					active: false
				},
				toggle: modelCollectionHelpers.toggle
			})
		},
		article_summary: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					viewing: false,
				},
				toggle: modelCollectionHelpers.toggle
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
			"instance": null,
			"Model": Backbone.Model.extend({})
		}
	}

	var collections = {
		init: {
			articles: function(){
				this.tags.instance = new this.tags.Collection(models.tags.instances);
				this.article_summaries.instance = new this.article_summaries.Collection(models.article_summary.instances);
				this.article_details.instance = new this.article_details.Collection([]);
			},
			"approval-river": function(){

			}
		},
		tags: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.tags.Model,
				getTrue: modelCollectionHelpers.getTrue
			})
		},
		article_summaries: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.article_summary.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut
			})
		},
		article_details: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.article_detail.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut
			})
		}
	}

	var routing = {
		init: {
			common: function(section){
				this.router = new this.Router(section); // Pass the section to the `initialize` function, which will then call our sections specific routes
				Backbone.history.start();
			},
			articles: function(){
				this.route(':section(/)', 'stripTrailingSlash');
				this.route('single/:uid', 'readSingle');
				this.route('compare/:uids', 'readCompare');
			},
			"approval-river": function(){

			}
		},
		Router: Backbone.Router.extend({
			initialize: function(section){
				// Initialize these section routes
				routing.init[section].call(this);
			},
			stripTrailingSlash: function(section){
				this.setState(section);
				routing.router.navigate(section, {replace: true});
			},
			readSingle: function(uid){
				// Zero out existing active articles, set the mode
				this.setState('single');
				// Set the model whose uid is in the hash to a `viewing` property of true
				collections.article_summaries.instance.where({'article_uid': uid})[0].set({'viewing': true})
			},
			readCompare: function(uids){
				// Zero out existing active articles, set the mode
				this.setState('compare');
				// This can be one or more, by splitting we turn it into an array, even if only an array of one item
				uids.split('&').forEach(function(uid){
					collections.article_summaries.instance.where({'article_uid': uid})[0].set({'viewing': true});
				})
			},
			setState: function(mode){
				collections.article_summaries.instance.zeroOut('viewing');
				models.article_mode.instance.set('mode', mode);
			},
			set: {
				single: function(articleUid){
					routing.router.navigate('single/' + articleUid);
				},
				compare: function(articleUid, isNew){
					var hash = window.location.hash,
							hash_test = routing.helpers.hasArticleUid(hash);
					if ( isNew ){
						// If it has a hash, add an ampersand
						// If not, add a trailing slash
						// Unless it already ends in a slash
						if ( hash_test ) {
							hash += '&';
						} else if (hash.substr(hash.length - 1, 1) != '/') {
							hash += '/';
						}
						// Append current selections to hash
						hash += (articleUid);
					} else {
						// Remove the id from the hash and the leading ampersand if it exists
						hash = hash.replace(new RegExp('(&|)'+articleUid, 'g'), '').replace('\/&', '\/');
					}
					routing.router.navigate(hash);
				}
			}
		}),
		helpers: {
			hasArticleUid: function(hash){
				// If it has a second index then it's true
				// If it's empty this will be undefined or ""
				return hash.split('/')[1];
			}
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

	var app = {
		init: {
			articles: function(){
				this.instance = new this.Articles();
			},
			"approval-river": function(){
				// this.instance = new this.ApprovalRiver();
			}
		},
		Articles: Backbone.View.extend({
			el: '#main-wrapper',

			initialize: function(){

				// Cache these selectors
				this.$tagList = $('#tag-list');
				this.$articleList = $('#article-list');
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$divisionSwitcher = $('.division-switcher');

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:active', this.articleSummarylist.update);

				// When a summary item has `viewing` set to true
				// Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
				this.listenTo(collections.article_summaries.instance, 'change:viewing', this.articleDetail.set.go);

				// Detailed data fetched by `article.set.go` is then either added or removed from a collection
				// Correspondingly the dom elements are baked or destroyed
				this.listenTo(collections.article_details.instance, 'add', this.articleDetail.listen.bake);
				this.listenTo(collections.article_details.instance, 'remove', this.articleDetail.listen.destroy);

				// Create views for every one of the models in the collection and add them to the page
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

				new views.DivisionSwitcher({ model: models.article_mode.instance, el: this.$divisionSwitcher })

				return this;
			},

			articleSummarylist: {
				update: function(){
					var active_tags = load.summaries.by.tag()
					return this;

				},
				bake: function(){
					
				}
			},
			articleDetail: {
				set: {
					go: function(articleSummaryModel){
						var is_new = this.articleDetail.set.check(articleSummaryModel),
								article_uid = articleSummaryModel.get('article_uid'),
								destination;
						// If it is a `viewing` article, fetch its data
						if (is_new) {
							destination = this.articleDetail.set.add;
						} else {
							destination = this.articleDetail.set.remove;
						}
						this.articleDetail.set.fetch( article_uid, destination );
						return this;
					},
					check: function(articleSummaryModel){
						// Returns true if this model is being viewed
						// False if it was the previously viewed model which triggered a change because we switched it its `viewing` prop to false
						return articleSummaryModel.get('viewing');
					},
					fetch: function(articleUid, cb){
						// For now, just have the fetch do the bake
						var loaded_matches = _.filter(articles_detailed, function(obj) { return obj.article_uid === articleUid });
						if (loaded_matches.length) {
							cb(loaded_matches[0]);
						} else {
							// TODO, handle fetching to the server
							// Give the article data to `this.setMain`

						}
					},
					add: function(articleData){
						collections.article_details.instance.add(articleData);
					},
					remove: function(articleData){
						var article_uid = articleData.article_uid;
						collections.article_details.instance.remove( collections.article_details.instance.where({article_uid: article_uid})[0] );
					}
				},
				listen: {
					bake: function(detailModel){
						var mode = models.article_mode.instance.get('mode'),
								article_uid = detailModel.get('article_uid'),
								article_view;

						if (mode == 'single'){
							article_view = new views.ArticleDetail({model: detailModel});
							this.$content.html(article_view.render().el);
						} else {
							article_view = new views.ArticleDetailCard({model: detailModel});
							this.$content.append(article_view.render().el);
						}
						return this;
					},
					destroy: function(detailModel){
						detailModel.set('destroy', true);
					}
				}
			}
		})
	}

	var views = {
		Tag: Backbone.View.extend({

			tagName: 'li',

			className: 'tag-wrapper',

			events: {
				click: 'toggle'
			},

			initialize: function(){
				this.listenTo(this.model, 'change', this.styleLayout);
			},

			render: function(){
				var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), templates.helpers) );

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

			tagName: 'li',

			className: 'article-summary-wrapper',

			events: {
				click: 'setViewing'
			},
			initialize: function(){
				this.listenTo(this.model, 'change:viewing', this.set.activeState);
			},

			render: function(){
				var article_summary_markup = templates.articleSummaryFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_summary_markup);

				return this;
			},

			set: {
				activeState: function(articleModel){
					if ( articleModel.get('viewing') ){
						this.$el.addClass('active');
					} else {
						this.$el.removeClass('active');
					}
					return this;
				}
			},

			setViewing: function(){
				var mode = models.article_mode.instance.get('mode');
						article_uid = this.model.get('article_uid');
				// If we're in article single view mode
				// And this article is not already selected
				if (mode == 'single' && !this.model.get('viewing')){
					// This section behaves like a radio button
					// Clear the last active article
					collections.article_summaries.instance.zeroOut('viewing');
					// And set this model to the one being viewed
					this.model.set('viewing', true);

				} else if (mode == 'compare') {
					// This section behaves like a checkbox
					this.model.set('viewing', !this.model.get('viewing'));
				}
				routing.router.set[mode]( this.model.get('article_uid'), this.model.get('viewing') );
				return this;
			}
		}),
		ArticleDetail: Backbone.View.extend({

			tagName: 'div',

			className: 'article-detail-wrapper',

			events: {
				// click: 'addEvent'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function(){
				var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_detail_markup);

				return this;
			},

			destroy: function(){
				if (this.model.get('destroy')) this.remove();
			}

		}),
		ArticleDetailCard: Backbone.View.extend({

			tagName: 'div',

			className: 'article-detail-wrapper',

			events: {
				'click': 'destroy'
			},

			initialize: function(){
				this.listenTo(this.model, 'change:destroy', this.destroy);
			},

			render: function() {
				var article_detail_markup = templates.articleDetailCardFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(article_detail_markup);
				return this;
			},

			destroy: function(){
				if (this.model.get('destroy')) this.remove();
			}

		}),
		DivisionSwitcher: Backbone.View.extend({

			events: {
				'click li': 'setMode'
			},
			initialize: function(){
				// Update the button active state and the hash
				this.listenTo(this.model, 'change:mode', this.updateActiveState);
				this.listenTo(this.model, 'change:mode', this.updateCollection);
				this.listenTo(this.model, 'change:mode', this.updateHash);
			},

			setMode: function(e){
				var mode = $(e.target).attr('data-mode');
				// And set this model to the one being viewed
				this.model.set('mode', mode);
				return this;
			},

			updateActiveState: function(){
				var mode = this.model.get('mode');
				// Put a data attribute on the drawer for css purposes
				this.$el.parents('#drawer').attr('data-mode', mode);
				this.$el.find('li').removeClass('active');
				this.$el.find('li[data-mode="'+mode+'"]').addClass('active');
				return this;
			},
			updateCollection: function(){
				// Remove all models in the collection, firing the remove event for each one
				collections.article_details.instance.remove( collections.article_details.instance.models );
				return this;
			},
			updateHash: function(){
				var mode = this.model.get('mode');
				// Update the mode in the hash
				// Before you switch
				// Grab the current page numbers listed
				var hash_arr = current_uids = [],
						new_uids = '';
						// new_uids = this.model.get('previous-uids') || '';

				// Only save a previous state if you have a previous article state
				if ( routing.helpers.hasArticleUid(window.location.hash) ){
					hash_arr = window.location.hash.split('/'); // ['#', 'single', 'a1']
					current_uids = hash_arr.slice(1, hash_arr.length)[0].split("&"); // In single mode, ['a1'], in compare, ['a1', 'a2', 'a3']
					// If we have something previously saved, used that
					// If not, our hash will just stay the same
					new_uids = new_uids || current_uids;
					// // If we're going into single mode and the hash has more than one uid, then we'll go to the first one
					if (mode == 'single' && current_uids.length > 1) new_uids = current_uids[0];
					if (_.isArray(new_uids)) new_uids = new_uids.join('&');
				}

				// Trigge the router here since we already have the code that can take a uid and find its model and set its `viewing:true`
				routing.router.navigate(mode + '/' + new_uids, {trigger: true});
				// TODO, test the previous state save better once the comparison selection is working better
				// Possible use the `options.previousModels` on the collection to set this, and then you have the actual models
				// Don't safe the current_uid if it's an empty array
				if (_.isArray(current_uids) && current_uids.length === 0) current_uids = '';
				this.model.set('previous-uids', current_uids);
				return this;
			}
		})
	}

	var listeners = {
		common: function(){
			// Kill all links on active elements
			$('#main-wrapper').on('click', '.active a', function(e){
				e.preventDefault();
			})
		}
	}

	var init = {
		go: function(){
			// Call the page specific functions
			var section = $('body').attr('data-section');
			// Their `this` should be the root object so you can still say `this.` even though you're nested in the object
			templates.init[section].call(templates);
			models.init[section].call(models);
			collections.init[section].call(collections);
			app.init[section].call(app);
			routing.init.common.call(routing, section);

			// Shared listener functions
			listeners.common();
		}
	}

	init.go();

}).call(this);
