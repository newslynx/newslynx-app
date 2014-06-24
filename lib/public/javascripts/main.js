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
			{ "name": "tag 1", "count": 5, "color": "#0cf" },
			{ "name": "tag 2", "count": 3, "color": "#fc0" },
			{ "name": "tag 3", "count": 1, "color": "#c0f" },
			{ "name": "tag 4", "count": 1, "color": "#f0c" },
			{ "name": "tag 5", "count": 0, "color": "#0fc" }
		]
	}

	var helpers = {
		// sanitizeForCss: function(tagName){
		// 	return tagName.replace(/ /g, '-');
		// }
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
				var tag_model = new models.tags.Model(tag);
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
				this.bake();
			},

			bake: function(){
				collections.tags.instance.each(function(tag){
					var tag_view = new views.Tag({ model: tag });
					this.$.tagList.append(tag_view.render().el);
				}, this);	// "this" is the context in the callback

				return this;
			},

			filterByTag: function(clickedModel){

				// Calculate the total order amount by agregating
				// the prices of only the checked elements
				var active_tags = collections.tags.instance.getEnabled();

				// TODO, do filtering articles based on active tags
				console.log(active_tags);

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
				this.listenTo(this.model, 'change', this.render);
			},

			render: function(){
				var tag_markup = this.template( this.model.toJSON() );
				// Set its border left color to the appropriate color value in its data
				this.$el.html(tag_markup).find('.tag-container').css('border-left-color', this.model.get('color'))
				return this;
			},

			toggle: function(){
				this.model.toggle();
				this.$el.toggleClass('active');

				// If this is enabled, set the background color to the correct color in its model
				if (this.model.get('enabled')){
					this.$el.find('.tag-container').css('background-color', this.model.get('color'));
				}
				return this;
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
