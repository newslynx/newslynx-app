(function(){

	var dummy_data =	 {
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
			{ "name": "tag 1", "count": 5 },
			{ "name": "tag 2", "count": 3 },
			{ "name": "tag 3", "count": 1 },
			{ "name": "tag 4", "count": 1 },
			{ "name": "tag 5", "count": 0 }
		]
	}

	var templates = {
		tagFactory: _.template( $('#tag-templ').html() )
	}

	var selection = {
		sorting: {

		},
		searching: {

		},
		filtering: {

		}
	}

	var models = {
		init: function(){
			dummy_data.tags.forEach(function(tag){
				var tag_model = new models.tags.Model({name: tag.name, count: tag.count});
				models.tags.instances.push(tag_model);
			})
		},
		tags: {
			instances: [],
			Model: Backbone.Model.extend({

				defaults: {
					enabled: false
				},

				toggle: function(){
					this.set('enabled', !this.get('enabled'));
				}

			})
		}
	}

	var collections = {
		init: function(){
			this.tags.instance = new this.tags.Collection(models.tags.instances);

		},
		tags: {
			Collection: Backbone.Collection.extend({

				model: models.tags.Tag,

				getEnabled: function(){
					return this.where({enabled: true});
				}

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
				this.$ = {} // Stashed jQuery selectors

				// Cache these selectors
				this.$.tagList = $('#tag-list');

				// Listen for the change event on the collection.
				// This is equivalent to listening on every one of the 
				// model objects in the collection.
				this.listenTo(collections.tags.instance, 'change:enabled', this.filterByTag);

				// Create views for every one of the models in the
				// collection and add them to the page
				collections.tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$.tagList.append(tag_view.render().el);
				}, this);	// "this" is the context in the callback
			},

			filterByTag: function(clickedModel){

				// Calculate the total order amount by agregating
				// the prices of only the checked elements
				// this.$el.toggle('active');
				var active_tags = collections.tags.instance.getEnabled();
				console.log(active_tags);

				// return this;
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
				this.listenTo(this.model, 'change', this.render);
			},

			render: function(){
				var tag_markup = this.template( this.model.toJSON() );
				this.$el.html(tag_markup);
				return this;
			},

			toggle: function(){
				this.model.toggle();
				this.$el.toggleClass('active');
			},


		})
	}

	var init = {
		go: function(){
			models.init();
			collections.init();
			views.init();

			// layout.tags.bake();
		}
	}

	init.go();

}).call(this);
