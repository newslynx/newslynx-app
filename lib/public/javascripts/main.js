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

	var alerts = [
		{
			"uid": "a1",
			"service": "NewsLynx",
			"short_name": "Trackbacks on other news sites",
			"search_query": "propalpatine.org",
			"enabled": true,
		},
		{
			"uid": "a2",
			"service": "Reddit",
			"short_name": "Domain mentions on Reddit",
			"search_query": "propalpatine.org",
			"enabled": true,
		},
		{
			"uid": "a3",
			"service": "Google",
			"short_name": "\"ProPalpatine\"",
			"search_query": "\"ProPalpatine\"",
			"enabled": true,
			"result_type": "everything",
			"language": "english",
			"region": "any",
			"how_many": "best"
		},
		{
			"uid": "a4",
			"service": "Google",
			"short_name": "\"ProPalpatine\" AND \"Fracking\"",
			"search_query": "\"ProPalpatine\" AND \"Fracking\"",
			"enabled": true,
			"result_type": "everything",
			"language": "english",
			"region": "any",
			"how_many": "best"
		}
	]

	var river_items = [
		{
			"alert_uid": "a3",
			"status": "pending",
			"title": "Empire declares ProPalpatine rated best news site",
			"text": "The carbon in our apple pies billions upon billions cosmos. Extraplanetary Hypatia. Tendrils of gossamer clouds? Rogue stirred by starlight across the centuries cosmic ocean white dwarf billions."
		},
		{
			"alert_uid": "a4",
			"status": "pending",
			"title": "ProPalpatine exposes anti-fracking movement's ties to rebellion",
			"text": "The carbon in our apple pies billions upon billions cosmos. Extraplanetary Hypatia. Tendrils of gossamer clouds? Rogue stirred by starlight across the centuries cosmic ocean white dwarf billions."
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
			var where_obj = {}; where_obj[key] = true;
			return this.where(where_obj);
		},
		zeroOut: function(key){
			this.getTrue(key).forEach(function(model){
				model.set(key, false);
			});
		},
		setTrueByIds: function(trueKey, idKey, ids){
			ids.split('&').forEach(function(id){
				var where_obj = {}; where_obj[idKey] = id;
				this.where(where_obj)[0].set(trueKey, true);
			}, this);
		}
	}

	var models = {
		init: {
			articles: function(){
				// Keep track of whether we're in single view or comparison view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'single');
			},
			"approval-river": function(){
				// Keep track of whether we're in `my-alerts or 'create-new' view
				this.section_mode.instance = new this.section_mode.Model().set('mode', 'my-alerts');
			}
		},
		// Common
		section_mode: {
			"instance": null,
			"Model": Backbone.Model.extend({
				defaults: {
					mode: null
				}
			})
		},
		drawer_list_item: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					viewing: false,
				},
				toggle: modelCollectionHelpers.toggle
			})
		},
		// Article models
		tags: {
			"instances": [],
			"Model": Backbone.Model.extend({
				defaults: {
					active: false
				},
				toggle: modelCollectionHelpers.toggle
			})
		},
		// Approval river models

	}

	var collections = {
		init: {
			articles: function(){
				// Tags
				this.tags.instance = new this.tags.Collection(org.tags);
				// Article summaries
				this.drawer_items.instance = new this.drawer_items.Collection(articles);
				// This will populate based on our selection
				this.detail_items.instance = new this.detail_items.Collection([]);
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
		drawer_items: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
				model: models.drawer_list_item.Model,
				getTrue: modelCollectionHelpers.getTrue,
				zeroOut: modelCollectionHelpers.zeroOut,
				setTrueByIds: modelCollectionHelpers.setTrueByIds
			})
		},
		// TODO, refactor to remove ununed collection functions
		detail_items: {
			"instance": null,
			"Collection": Backbone.Collection.extend({
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
				this.route('', function(){ routing.router.navigate('single'); });
				this.route(':mode(/)', 'stripTrailingSlash');
				this.route(':mode/:uid', 'readArticle');
			},
			"approval-river": function(){
				this.route('', function(){ routing.router.navigate('my-alerts'); });
				this.route(':mode', 'readRiverMode');
			}
		},
		Router: Backbone.Router.extend({
			initialize: function(section){
				// Initialize the routes for this section
				routing.init[section].call(this);
			},
			stripTrailingSlash: function(mode){
				app.instance.drawer.setMode(mode);
				routing.router.navigate(mode, {replace: true});
			},
			readArticle: function(mode, uids){
				app.instance.drawer.changeActive(mode, uids);
			},
			readRiverMode: function(mode){
				app.instance.drawer.setMode(mode);
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
				this.instance = new this.ApprovalRiver();
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

				// Update hash and active collection on mode change
				this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateCollection);
				this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateHash);

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:active', this.drawer.filter);

				// When a summary item has `viewing` set to true
				// Fetch or find the detailed data for that article and set the `models.article_detail.instance` values to that data
				this.listenTo(collections.drawer_items.instance, 'change:viewing', this.articleDetail.set.go);

				// Detailed data fetched by `article.set.go` is then either added or removed from a collection
				// Correspondingly the dom elements are baked or destroyed
				this.listenTo(collections.detail_items.instance, 'add', this.articleDetail.listen.bake);
				this.listenTo(collections.detail_items.instance, 'remove', this.articleDetail.listen.destroy);

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
				collections.drawer_items.instance.each(function(article){
					var article_view = new views.ArticleSummary({model: article});
					this.$articleList.append(article_view.render().el);
				}, this);

				new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })

				return this;
			},

			divisionSwitcher: {
				updateCollection: function(){
					// Remove all models in the collection, firing the remove event for each one
					collections.detail_items.instance.remove( collections.detail_items.instance.models );
					return this;
				},
				updateHash: function(sectionMode){
					var mode = sectionMode.get('mode');
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

					// Save the url hash
					routing.router.navigate(mode + '/' + new_uids);

					// Set these ids to `viewing: true`
					app.instance.drawer.changeActive(mode, new_uids);
					// TODO, test the previous state save better once the comparison selection is working better
					// Possible use the `options.previousModels` on the collection to set this, and then you have the actual models
					// Don't safe the current_uid if it's an empty array
					if (_.isArray(current_uids) && current_uids.length === 0) current_uids = '';
					sectionMode.set('previous-uids', current_uids);
					return this;
				}
			},

			drawer: {
				setMode: function(mode){
					collections.drawer_items.instance.zeroOut('viewing');
					models.section_mode.instance.set('mode', mode);
				},
				changeActive: function(mode, uids){
					this.setMode(mode);
					if (uids) collections.drawer_items.instance.setTrueByIds('viewing', 'article_uid', uids);
				},
				filter: function(){
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
						collections.detail_items.instance.add(articleData);
					},
					remove: function(articleData){
						var article_uid = articleData.article_uid;
						collections.detail_items.instance.remove( collections.detail_items.instance.where({article_uid: article_uid})[0] );
					}
				},
				listen: {
					bake: function(detailModel){
						var mode = models.section_mode.instance.get('mode'),
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
		}),
		ApprovalRiver: Backbone.View.extend({
			el: '#main-wrapper',

			initialize: function(){

				// Cache these selectors
				this.$drawer = $('#drawer');
				this.$content = $('#content');
				this.$divisionSwitcher = $('.division-switcher');

				// Update hash and active collection on mode change
				this.listenTo(models.section_mode.instance, 'change:mode', this.divisionSwitcher.updateHash);

				// Create views for every one of the models in the collection and add them to the page
				this.bake();
			},

			bake: function(){
				// // Tags
				// collections.tags.instance.each(function(tag){
				// 	var tag_view = new views.Tag({ model: tag });
				// 	this.$tagList.append(tag_view.render().el);
				// }, this);	// "this" is the context in the callback

				// // Article list
				// collections.drawer_items.instance.each(function(article){
				// 	var article_view = new views.ArticleSummary({model: article});
				// 	this.$articleList.append(article_view.render().el);
				// }, this);

				new views.DivisionSwitcher({ model: models.section_mode.instance, el: this.$divisionSwitcher })

				return this;
			},
			divisionSwitcher: {
				updateHash: function(sectionMode){
					var mode = sectionMode.get('mode');
					routing.router.navigate(mode);
				}
			},
			drawer: {
				setMode: function(mode){
					// collections.drawer_items.instance.zeroOut('viewing');
					models.section_mode.instance.set('mode', mode);
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

			className: 'article-summary-wrapper drawer-item',

			events: {
				click: 'setViewing'
			},
			initialize: function(){
				this.listenTo(this.model, 'change:viewing', this.set.activeState);
			},

			render: function(){
				var drawer_list_item_markup = templates.articleSummaryFactory( _.extend(this.model.toJSON(), templates.helpers) );
				this.$el.html(drawer_list_item_markup);

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
				var mode = models.section_mode.instance.get('mode');
						article_uid = this.model.get('article_uid');
				// If we're in article single view mode
				// And this article is not already selected
				if (mode == 'single' && !this.model.get('viewing')){
					// This section behaves like a radio button
					// Clear the last active article
					collections.drawer_items.instance.zeroOut('viewing');
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
				this.updateActiveState();
			},

			setMode: function(e){
				// Only set it if it's different, i.e. doesn't have an `active` class
				// This doesn't make that much of a difference because we listen for change events
				// But it's still nice
				var $el = $(e.target);
				if (!$el.hasClass('active')){
					var mode = $el.attr('data-mode');
					// And set this model to the one being viewed
					this.model.set('mode', mode);
				}
				return this;
			},

			updateActiveState: function(){
				var mode = this.model.get('mode');
				// Put a data attribute on the drawer for css purposes in the article view
				// This lets you have a different hover style when you hover over a checkbox article summary so you know you can do something to it
				this.$el.parents('#drawer').attr('data-mode', mode);
				// Set the active state on the li
				this.$el.find('li').removeClass('active');
				this.$el.find('li[data-mode="'+mode+'"]').addClass('active');
				// Show any els that have a data-mode attribute equal to the current mode
				$('.drawer-container[data-mode="'+mode+'"]').show();
				// Hide any that don't have the right one
				$('.drawer-container[data-mode!="'+mode+'"]').hide();

				return this;
			}

		})
		// Approval river views

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
		}
	}

	init.go();

}).call(this);