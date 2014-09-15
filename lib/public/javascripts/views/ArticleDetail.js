views.ArticleDetail = Backbone.View.extend({

	tagName: 'div',

	className: 'article-detail-wrapper',

	events: {
		'click .tab': 'switchTabs',
		'click .modal-toggle': 'toggleModal',
		'click .modal-close': 'toggleModal',
	},

	initialize: function(){
		this.listenTo(this.model, 'change:destroy', this.destroy);

		// This will populate from a pourover selection of events per detail article
		this.article_detailed_events_collection = new collections.article_detailed_events.Collection;

		// Listen to changes on it and add / remove events accordingly
		this.listenTo(this.article_detailed_events_collection, 'add', this.eventsGallery.add);
		this.listenTo(this.article_detailed_events_collection, 'remove', this.eventsGallery.remove);

		/* Tag baking */
		// Listen for adding things from the page and bake them
		this.listenTo(collections.article_detailed_subject_tags.instance, 'add', this.subject_tags.add);
		this.listenTo(collections.article_detailed_subject_tags.instance, 'remove', this.subject_tags.remove);

		// Do the same thing for impact categories
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
		var promotions_data = this.model.get('promotion');

		// Instaniate collection
		collections.po.article_detailed_events = new PourOver.Collection(events_data);

		// Add filters
		collections.po.article_detailed_events.addFilters([collections.po.filters.impact_tags, collections.po.filters.impact_tag_categories, collections.po.filters.impact_tag_levels, collections.po.filters.timestamps]);
			
		views.po.article_detailed_events = new PourOver.View('article_detailed_events_view', collections.po.article_detailed_events);

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
			.timezoneOffset(parseFloat(pageData.orgInfo.timezone))
			.y(function(d) { return +d.count; })
			.legend(this.legend)
			.events(events_data)
			.promotions(promotions_data)
			.interpolate('step-after')
			.onBrush(this.filterEventsByDateRange_throttled);
		/* end spotted tail*/

	},

	render: function(){
		console.log(this.model.toJSON())
		var article_detail_markup = templates.articleDetailFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(article_detail_markup);

		return this;
	},

	bakeInteractiveBits: function(){
		// Event creator element
		this.$eventCreator = $('#event-creator-container');
		// Tag elements
		this.$subjectTagsContainer         = this.$el.find('.article-info-container[data-which="subject"] ul.tags');
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
		// this.d3_el = d3.select('#events-gallery-container');
		this.bakeEventsGallery();

		return this;
	},

	bakeChart: function(){
		d3.select(this.chartSelector)
			.datum(this.timeseriesData)
			.call(this.spottedTail);
	},

	bakeEventsGalleryFilters: function(){
		// Impact tags
		if (this.articles_impact_tags_collection.length){
			this.$impactTagsList.html('');
			this.articles_impact_tags_collection.each(function(tagModel){
				var tag_view = new views.Tag({ model: tagModel });
				this.$impactTagsList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (this.articles_impact_tag_categories_collection.length){
			this.articles_impact_tag_categories_collection.each(function(tagModel){
				this.$impactTagCategoriesList.html('');
				var tag_view = new views.Tag({ model: tagModel });
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (this.articles_impact_tag_levels_collection.length){
			this.articles_impact_tag_levels_collection.each(function(tagModel){
				this.$impactTagLevelsList.html('');
				var tag_view = new views.Tag({ model: tagModel });
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		return this;
	},

	bakeEventsGallery: function(){
		var events_data = this.model.get('events');

		// TODO, populate this with a pourover collection
		if (events_data){
			this.article_detailed_events_collection.set(events_data);
		}
		return this;
	},

	eventsGallery: {
		add: function(eventModel){
			eventModel.set('in_selection', true);
			item_view = new views.ArticleDetailEvent({model: eventModel});
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
			// This view should maintain a sort but PourOver doesn't want to.
			current_filtered_set.sort(function(a,b){
				if (a.timestamp > b.timestamp) return -1;
				if (a.timestamp < b.timestamp) return 1;
				return 0;
			});

			// console.log(current_filtered_set, this)

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

		// Set up the other collections and page elements
		// Populate tags into the subject_tag
		var subject_tags_full     = this.model.get('subject_tags_full');
		var impact_tag_categories = this.model.get('impact_tag_categories');
		var impact_tag_levels     = this.model.get('impact_tag_levels');

		// If we have subject tags, clear our placeholder 'No tags' and add the real tags
		if (subject_tags_full.length){
			this.$subjectTagsContainer.html('');
			collections.article_detailed_subject_tags.instance.set(subject_tags_full);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_subject_tags.instance.reset();
		}

		// Impact tag categories
		if (impact_tag_categories.length){
			this.$impactTagCategoriesContainer.html('');
			collections.article_detailed_impact_tag_attributes.categories_instance.set(impact_tag_categories);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.categories_instance.reset();
		}

		// Impact tag levels
		if (impact_tag_levels.length){
			this.$impactTagLevelsContainer.html('');
			collections.article_detailed_impact_tag_attributes.levels_instance.set(impact_tag_levels);
		} else {
			// If we don't have anything, empty this collection
			collections.article_detailed_impact_tag_attributes.levels_instance.reset();
		}


		if (collections.subject_tags.instance.length){
			this.$editSubjectTagsContainer.html('<div class="description">Add subject tags to this article.</div>');
			collections.subject_tags.instance.each(function(subjectTagModel){
				subject_tag_view = new views.ArticleDetailAccountSubjectTag({model: subjectTagModel});
				subject_tag_el = subject_tag_view.render().el;
				this.$editSubjectTagsContainer.append(subject_tag_el);
			}, this);
		}
	},

	subject_tags: {
		add: function(subjectTagModel){
			item_view = new views.ArticleDetailSubjectTag({model: subjectTagModel});
			item_el = item_view.render().el;
			this.$subjectTagsContainer.append(item_el);
			return this;
		},
		remove: function(){
			// TODO, do remove
			// console.log('remove tag');
			return this;
		}
	},
	impact_tag_attribute: {
		add: function(attributeModel, collection){
			// This will tell us if we should append to the `category` or `level` list
			var which_collection = collection.metadata('which'),
					containers = {
						categories: this.$impactTagCategoriesContainer,
						levels: this.$impactTagLevelsContainer    
					},
					container = containers[which_collection];

			item_view = new views.ArticleDetailAttributeTag({model: attributeModel});
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

		// Create an instance of an event creator view
		new views.EventCreator({assignee: assignee, el: this.$eventCreator[0]});
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

	switchTabs: function(e){
		var $tab = $(e.currentTarget),
				group,
				$target;

		// Only proceed if there is no active class
		if (!$tab.hasClass('active')){
			group   = $tab.attr('data-group');
			$target = $('.detail-section[data-group="'+group+'"]');
			// Update style on this tab
			this.$el.find('.tab').removeClass('active');
			$tab.addClass('active');

			// Hide other section
			$('.detail-section').hide();
			// Show the section we want
			$target.show();
		}
		return this;
	},

	toggleModal: function(e){
		// Open up a modal that lets you assign it to something
		views.helpers.toggleModal(e);
	}


});
