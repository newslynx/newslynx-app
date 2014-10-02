views.ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		'click .tab': 'setActiveTabFromClick',
		'click .modal-toggle': 'toggleModal',
		'click .modal-close': 'toggleModal'
	},

	initialize: function(){
		// Keep track of all views this view creates
		this._subviews = [];
		this.listenTo(this.model, 'change:destroy', this.destroyView);

		// This will populate from a pourover selection of events per detail article
		this.article_detailed_events_collection = new collections.article_detailed_events.Collection;

		// Listen to changes on it and add / remove events accordingly
		this.listenTo(this.article_detailed_events_collection, 'add', this.eventsGallery.add);
		this.listenTo(this.article_detailed_events_collection, 'remove', this.eventsGallery.remove);

		/* Tag baking */
		// Listen for adding things from the page and bake them
		this.listenTo(collections.article_detailed_subject_tags.instance, 'add', this.subject_tags.add);
		this.listenTo(collections.article_detailed_subject_tags.instance, 'remove', this.subject_tags.remove);

		// Do the same thing for impact tags
		this.listenTo(collections.article_detailed_impact_tags.instance, 'add', this.impact_tags.add);
		this.listenTo(collections.article_detailed_impact_tags.instance, 'remove', this.impact_tags.remove);

		// And impact categories
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'add', this.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.categories_instance, 'remove', this.impact_tag_attribute.remove);

		// And levels
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'add', this.impact_tag_attribute.add);
		this.listenTo(collections.article_detailed_impact_tag_attributes.levels_instance, 'remove', this.impact_tag_attribute.remove);
		/* end tag baking */

		/* Setup event filtering */

		var article_impact_tags = this.model.get('impact_tags_full'),
				article_impact_tag_categories = this.model.get('impact_tag_categories'),
				article_impact_tag_levels = this.model.get('impact_tag_levels');

		this.articles_impact_tags_collection 						= new collections.impact_tags.Collection(article_impact_tags);
		this.articles_impact_tag_categories_collection	= new collections.impact_tag_attributes.Collection(article_impact_tag_categories);
		this.articles_impact_tag_levels_collection			= new collections.impact_tag_attributes.Collection(article_impact_tag_levels);

		// These metadata settings are for eyedropping into PourOver
		// So on click, it's clear what to filter by
		this.articles_impact_tags_collection.metadata('po_collection', 'article_detailed_events');
		this.articles_impact_tag_categories_collection.metadata('po_collection', 'article_detailed_events');
		this.articles_impact_tag_levels_collection.metadata('po_collection', 'article_detailed_events');

		this.articles_impact_tag_categories_collection.metadata('filter', 'impact_tag_categories');
		this.articles_impact_tag_levels_collection.metadata('filter', 'impact_tag_levels');
		// Initialize PourOver collection
		// Reusing the filters we made at the beginning
		var events_data = this.model.get('events');
		var promotions_data = this.model.get('promotions');

		// Instaniate collection
		collections.po.article_detailed_events = new PourOver.Collection(events_data);

		// Add filters
		collections.po.article_detailed_events.addFilters([collections.po.filters.impact_tags, collections.po.filters.impact_tag_categories, collections.po.filters.impact_tag_levels, collections.po.filters.timestamps]);
		
		// Add timestamp sort
		collections.po.article_detailed_events.addSorts([collections.po.sorts.timestamp_desc]);

		// Create view
		views.po.article_detailed_events = new PourOver.View('article_detailed_events_view', collections.po.article_detailed_events);

		// Set the sort on the view
		views.po.article_detailed_events.setSort('timestamp_desc2');

		// Listen to changes in the PourOver view and `set` `collections.article_summaries_instance` to the results of that view
		// Firing add and remove events on those models
		var that = this;
		views.po.article_detailed_events.on('update', function(){
			that.eventsGallery.setActiveEvents.call(that);
		});

		/* end event filtering */


		/* Setup Spotted Tail */
		this.chartSelector = '#ST-chart';

		this.legend =	{
			facebook_share_count: {service: 'Facebook', metric: 'shares', color: '#3B5998', group: 'a'},
			twitter_count: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
			pageviews: {service: '', metric: 'pageviews', color: '#ad00bd', group: 'b'}
		};

		// Throttle this for onBrush callback
		this.filterEventsByDateRange_throttled = _.throttle(this.filterEventsByDateRange, 100);

		// This is a method and not just `this.model.get('timeseries_states')` because we can do some filtering and things to determine what slice of the data we want
		this.timeseriesData = this.model.getTimeSeriesStats();
		var that = this;

		this.spottedTail = spottedTail()
			.timezoneOffset(pageData.timezone)
			.y(function(d) { return +d.count; })
			.legend(this.legend)
			.events(events_data)
			.promotions(promotions_data)
			.interpolate('step-after')
			.onBrush(this.filterEventsByDateRange_throttled);
		/* end spotted tail*/

		// Throttle resize
		this.onWindowResize_throttled = _.throttle(this.onWindowResize, 200);

		$( window ).resize(function() {
			that.onWindowResize_throttled.call(that);;
		});


	},

	render: function(){
		console.log(this.model.toJSON())
		var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), helpers.templates) );
		// console.log('markup', article_detail_markup)
		this.$el.html(article_detail_markup);

		return this;
	},

	bakeInteractiveBits: function(){
		var that = this;
		// Event creator element
		this.$eventCreator = $('#event-creator-container');
		// Tag elements
		this.$subjectTagsContainer         = this.$el.find('.article-info-container[data-which="subject"] ul.tags');
		this.$impactTagsContainer         = this.$el.find('.article-info-container[data-which="impact"] ul.tags');
		this.$impactTagCategoriesContainer = this.$el.find('.article-info-container[data-which="impact-categories"] ul.tags');
		this.$impactTagLevelsContainer     = this.$el.find('.article-info-container[data-which="impact-levels"] ul.tags');
		// Bake all of this newsroom's subject tags under the edit subject tags option
		this.$editSubjectTagsContainer     = this.$el.find('#subject-tag-settings');

		// The filer options for the events gallery
		this.$impactTagsList = this.$el.find('.option-container[data-type="impact-tags"] .tag-list');
		this.$impactTagCategoriesList = this.$el.find('.option-container[data-type="impact-tag-categories"] .tag-list');
		this.$impactTagLevelsList = this.$el.find('.option-container[data-type="impact-tag-levels"] .tag-list');

		// Events gallery container
		this.$eventsContainer = this.$el.find('#events-gallery-container');

		// What are we doin? 
		this.bakeChart();
		this.bakeSubjectTags();
		this.bakeEventCreator();
		this.bakeEventsGalleryFilters();
		this.bakeArticleVizs();
		// this.d3_el = d3.select('#events-gallery-container');
		this.eventsGallery.setActiveEvents.call(this);

		// Bake some navigation
		this.setDetailNavigation();

		this.calcStickyOffsets();

		// Which tab is viewing
		this.setActiveTab();

		return this;
	},

	bakeChart: function(){
		d3.select(this.chartSelector)
			.datum(this.timeseriesData)
			.call(this.spottedTail);
	},

	calcStickyOffsets: function(){
		// Save the offset of the sticky element
		var $sticky = this.$el.find('.sticky'),
				$sticky_anchor = this.$el.find('.sticky-anchor'),
				sticky_anchor_offset;

		if ($sticky.length && $sticky_anchor.length) {
			sticky_anchor_offset = $sticky_anchor.position().top + $('#content').scrollTop();
			$sticky.attr('data-offset', sticky_anchor_offset);
		}

		return this;
	},

	onWindowResize: function(){
		this.calcStickyOffsets();
	},

	bakeEventsGalleryFilters: function(){
		// Impact tags
		if (this.articles_impact_tags_collection.length){
			this.$impactTagsList.html('');
			this.articles_impact_tags_collection.each(function(tagModel){
				var tag_view = new views.Tag({ model: tagModel });
				// Keep track of this subview so that we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagsList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (this.articles_impact_tag_categories_collection.length){
			this.articles_impact_tag_categories_collection.each(function(tagModel){
				this.$impactTagCategoriesList.html('');
				var tag_view = new views.Tag({ model: tagModel });
				// Keep track of this subview so that we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (this.articles_impact_tag_levels_collection.length){
			this.articles_impact_tag_levels_collection.each(function(tagModel){
				this.$impactTagLevelsList.html('');
				var tag_view = new views.Tag({ model: tagModel });
				// Keep track of this subview so that we might destroy it later!
				this._subviews.push(tag_view);
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		return this;
	},

	bakeArticleVizs: function(){

		var $articleVizsReadingContainer = this.$el.find('section.detail-section[data-group="reading"]');
		var $articleVizsTweetsContainer = this.$el.find('section.detail-section[data-group="tweeting"]');
		var referrer_metrics = this.model.get('referrer_metrics');
		var tweet_info = this.model.get('tweet_info');

		// Only bake these if we have referrer data
		if (!_.isEmpty(referrer_metrics)){
			$articleVizsReadingContainer.html('');
			/* DEVICE FACET */
			var device_facet_view = new views.ArticleDetailVizDeviceFacet({
				title: 'On which devices are people reading?', 
				referrer_metrics: referrer_metrics,
				which: 'device'
			});
			this._subviews.push(device_facet_view);
			var device_facet_markup = device_facet_view.render('marker-also').el;
			$articleVizsReadingContainer.append(device_facet_markup);
			/* end device facet */

			/* INTERNAL/EXTERNAL */
			var internal_external_facet_view = new views.ArticleDetailVizInternalExternal({
				title: 'Is traffic internally or externally driven?', 
				referrer_metrics: referrer_metrics,
				which: 'internal-external'
			});
			this._subviews.push(internal_external_facet_view);
			var internal_external_facet_markup = internal_external_facet_view.render('marker-also').el;
			$articleVizsReadingContainer.append(internal_external_facet_markup);
			/* end device facet */

			/* DOMAIN REFERRERS */
			var domain_facet_view = new views.ArticleDetailVizDomainFacets({
				title: 'Who\'s sending readers here?', 
				referrer_metrics: referrer_metrics,
				which: 'domain-referrers'
			});
			this._subviews.push(domain_facet_view);
			var domain_facet_markup = domain_facet_view.render().el;
			$articleVizsReadingContainer.append(domain_facet_markup);
			/* end device facet */

			/* ARTICLE REFERRERS */
			var domain_facet_view = new views.ArticleDetailVizArticleReferrers({
				title: 'What articles link here?', 
				referrer_metrics: referrer_metrics,
				which: 'article-referrers'
			});
			this._subviews.push(domain_facet_view);
			var domain_facet_markup = domain_facet_view.render().el;
			$articleVizsReadingContainer.append(domain_facet_markup);
			/* end article referrers */

		}

		/* TWEEETZ */
		if (!_.isEmpty(tweet_info)){
			$articleVizsTweetsContainer.html('');
			var tweets_view = new views.ArticleDetailVizTweets({
				title: 'Who\'s tweeted this story?', 
				tweet_info: tweet_info,
				which: 'tweets'
			});
			this._subviews.push(tweets_view);
			var tweet_markup = tweets_view.render().el;
			$articleVizsTweetsContainer.append(tweet_markup);
			/* end tweetz */
			
		}


		return this;
	},

	eventsGallery: {
		add: function(eventModel){
			var item_view,
					item_el;
			eventModel.set('in_selection', true);
			item_view = new views.ArticleDetailEvent({model: eventModel});
			// Keep track of this subview so that we might destroy it later!
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$eventsContainer.append(item_el);
			return this;
		},
		remove: function(eventModel){
			eventModel.set('in_selection', false);
			return this;
		},
		setActiveEvents: function(){
			var current_filtered_set = views.po.article_detailed_events.getCurrentItems();

			// // To maintain the correct sort order on the dom, we want to empty it
			this.article_detailed_events_collection.set([]);
			// // For changing the drawer list items based on filters
			this.article_detailed_events_collection.set(current_filtered_set);
		}
	},

	updateEventGalleryItems: function(){
		return this;
	},

	bakeSubjectTags: function(){
		// Append some things after the HTML has been baked
		// Such as tags
		var local_subject_tags_collection;

		// Helper function
		var doesThisArticleHaveThisTag = function(tagName){
			var this_articles_tag_names = collections.article_detailed_subject_tags.instance.pluck('name'),
					has_this_tag = _.contains(this_articles_tag_names, tagName),
					return_val = false;
			if (has_this_tag) {
				return_val = true;
			}
			return return_val;
		};

		var new_model_urlRoot = function(){
			var article_id = collections.article_detailed.instance.pluck('id')[0];
			return '/api/articles/'+article_id+'/subjects';
		};

		// Set up the other collections and page elements
		// Populate tags into the subject_tag
		var subject_tags_full     = this.model.get('subject_tags_full');
		var impact_tags_full      = this.model.get('impact_tags_full');
		var impact_tag_categories = this.model.get('impact_tag_categories');
		var impact_tag_levels     = this.model.get('impact_tag_levels');

		// If we have subject tags, clear our placeholder 'No tags' and add the real tags
		if (subject_tags_full.length){
			this.$subjectTagsContainer.html('');
			collections.article_detailed_subject_tags.instance.set(subject_tags_full);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_subject_tags.instance.set([]);
		}

		// Impact tag categories
		if (impact_tags_full.length){
			this.$impactTagsContainer.html('');
			collections.article_detailed_impact_tags.instance.set(impact_tags_full);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tags.instance.set([]);
		}


		// Impact tag categories
		if (impact_tag_categories.length){
			this.$impactTagCategoriesContainer.html('');
			collections.article_detailed_impact_tag_attributes.categories_instance.set(impact_tag_categories);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.categories_instance.set([]);
		}

		// Impact tag levels
		if (impact_tag_levels.length){
			this.$impactTagLevelsContainer.html('');
			collections.article_detailed_impact_tag_attributes.levels_instance.set(impact_tag_levels);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.levels_instance.set([]);
		}


		// Add all account subject tags to the maker modal
		if (collections.subject_tags.instance.length){
			this.$editSubjectTagsContainer.html('<div class="description">Add subject tags to this article.</div>');

			// Make a copy for every article
			collections.subject_tags.instance.each(function(subjectTagModel){
				var subject_tag_view,
						subject_tag_el,
						new_model = subjectTagModel.clone(),
						tag_selected = doesThisArticleHaveThisTag(new_model.get('name'));

				new_model.set('selected', tag_selected);
				new_model.urlRoot = new_model_urlRoot;

				subject_tag_view = new views.ArticleDetailAccountSubjectTag({model: new_model});
				// Keep track of this subview so that we might destroy it later!
				this._subviews.push(subject_tag_view);
				subject_tag_el = subject_tag_view.render().el;
				this.$editSubjectTagsContainer.append(subject_tag_el);
			}, this);
		}
	},

	subject_tags: {
		add: function(subjectTagModel){
			var item_view,
					item_el;
			item_view = new views.ArticleDetailSubjectTag({model: subjectTagModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$subjectTagsContainer.append(item_el);
			return this;
		},
		remove: function(subjectTagModel){
			// console.log('removing')
			// this.killView();
			subjectTagModel.set('destroy', true);
			return this;
		}
	},	
	impact_tags: {
		add: function(impactTagModel){
			var item_view,
					item_el;
			item_view = new views.ArticleDetailImpactTag({model: impactTagModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			this.$impactTagsContainer.append(item_el);
			return this;
		},
		remove: function(subjectTagModel){
			// console.log('removing')
			// this.killView();
			subjectTagModel.set('destroy', true);
			return this;
		}
	},
	impact_tag_attribute: {
		add: function(attributeModel, collection){
			var item_view,
					item_el;
			// This will tell us if we should append to the `category` or `level` list
			var which_collection = collection.metadata('which'),
					containers = {
						categories: this.$impactTagCategoriesContainer,
						levels: this.$impactTagLevelsContainer    
					},
					container = containers[which_collection];

			item_view = new views.ArticleDetailAttributeTag({model: attributeModel});
			this._subviews.push(item_view);
			item_el = item_view.render().el;
			container.append(item_el);
			return this;
		},
		remove: function(){

		}
	},

	bakeEventCreator: function(){
		// We will pass the assignee into the event creator view so it can set that field
		var assignee = {
			id: this.model.get('id'),
			title: this.model.get('title')
		};

		var defaults = {
			assignees: [assignee]
		}

		// Create an instance of an event creator view
		var event_creator_view = new views.EventCreator({defaults: defaults, el: this.$eventCreator[0]});
		this._subviews.push(event_creator_view);
		this._time_picker = event_creator_view.time_picker;
		return this;
	},

	filterEventsByDateRange: function(timestampRange, empty){
		// Reconvert out of user timezone and set to timestamp
		collections.po.article_detailed_events.filters.timestamp.clearQuery();
		// The second argument tells us whether our brush is empty, only filter it if we are actively filtering, aka, not empty
		// This protects against the situation where the date of an event is outside the range of the graph
		// Clicking off the graph filter will set your filter to its extents, which may not be the extends of your events
		if (!empty){
			collections.po.article_detailed_events.filters.timestamp.intersectQuery(timestampRange)
		}
	},

	setActiveTab: function(){
		var group = collections.article_detailed.instance.metadata('selected-tab');

		var $tab 		= this.$el.find('.tab[data-group="'+group+'"]'),
				$target = $('.detail-section[data-group="'+group+'"]');
		// Update style on this tab
		this.$el.find('.tab').removeClass('active');
		$tab.addClass('active');

		// Hide other section
		$('.detail-section').hide();
		// Show the section we want
		$target.show();

		return this;
	},

	setActiveTabFromClick: function(e){
		var $tab = $(e.currentTarget),
				group;

		// Only proceed if there is no active class
		if (!$tab.hasClass('active')){
			group   = $tab.attr('data-group');
			collections.article_detailed.instance.metadata('selected-tab', group);
			this.setActiveTab();
		}
		return this;
	},

	setDetailNavigation: function(){
		var comparison_ids = collections.article_comparisons.instance.pluck('id'),
				this_id = this.model.id,
				this_id_index = comparison_ids.indexOf(this_id),
				$nav = this.$el.find('.article-detail-navigation'),
				$prev = $nav.find('.prev'),
				$next = $nav.find('.next'),
				$spacer = $nav.find('.spacer'),
				prev_model_index = this_id_index - 1,
				next_model_index = this_id_index + 1,
				prev_model,
				next_model,
				prev_title,
				next_title;

		if (this_id_index != -1) {
			// If it's not the first one, print a previous
			if (this_id_index > 0) {
				prev_model = collections.article_comparisons.instance.at(prev_model_index);
				prev_title = helpers.templates.htmlDecode(prev_model.get('title'));

				$prev.html(' Prev')
					.addClass('go-to-detail')
					.attr('data-id',  prev_model.id)
					.attr('aria-label', prev_title)
					.prepend('<span class="octicon octicon-chevron-left"></span>')
			}

			// If it's not the last one print a next
			if (this_id_index < comparison_ids.length - 1) {
				next_model = collections.article_comparisons.instance.at(next_model_index);
				next_title = helpers.templates.htmlDecode(next_model.get('title'));

				$next.html('Next ')
					.addClass('go-to-detail')
					.attr('data-id', next_model.id)
					.attr('aria-label', next_title)
					.append('<span class="octicon octicon-chevron-right"></span>')

			}

		}

	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	},

	destroyView: function(model, destroyMode){
		// this._time_picker.destroy();
		this.killView();
	}


});
