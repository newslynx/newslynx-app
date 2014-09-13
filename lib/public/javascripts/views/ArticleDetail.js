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


		/* Setup Spotted Tail */
		this.chartSelector = '#ST-chart';

		this.legend =	{
			facebook_share_count: {service: 'Facebook', metric: 'shares', color: '#3B5998', group: 'a'},
			twitter_count: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
			pageviews: {service: '', metric: 'pageviews', color: '#ad00bd', group: 'b'}
		}

		var events_data = this.model.get('events');
		// TODO, figure out a better way to do this
		// Create a deep copy of this object
		this.eventsData = _.map(events_data, function(eventData){ return $.extend(true, {}, eventData); })
		// This is a method and not just `this.model.get('timeseries_states')` because we can do some filtering and things to determine what slice of the data we want
		this.timeseriesData = this.model.getTimeSeriesStats();
		var that = this;

		this.spottedTail = spottedTail()
			.x(function(d) { 
				var utc_date = new Date(d.timestamp*1000),
						user_timezone_date = new Date(new Date(utc_date).setHours(utc_date.getHours() + parseFloat(pageData.orgInfo.timezone) ));
				return user_timezone_date;
			})
			.y(function(d) { return +d.count; })
			.legend(this.legend)
			.eventSchema(pageData.impactCategoriesInfo) // TEMPORARY, this should be a nesting of `impact_tags` and `impact_categories`
			.events(this.eventsData)
			.interpolate('step-after')
			.onBrush(this.filterEventsByDateRange);
		/* end spotted tail*/

	},

	render: function(){
		// console.log(this.model.toJSON())
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

		// What are we doin? 
		this.bakeChart();
		this.bakeSubjectTags();
		this.bakeEventCreator();
		this.bakeEventGalleryFilters();
		this.bakeEventGallery();

		return this;
	},

	bakeChart: function(){
		d3.select(this.chartSelector)
			.datum(this.timeseriesData)
			.call(this.spottedTail);
	},

	bakeEventGalleryFilters: function(){
		var impact_tags 					= this.model.get('impact_tags_full'),
				impact_tag_categories = this.model.get('impact_tag_categories'),
				impact_tag_levels			= this.model.get('impact_tag_levels');

		// Impact tags
		if (impact_tags.length){
			this.$impactTagsList.html('');
			impact_tags.forEach(function(tag){
				var tag_model = new models.impact_tag.Model(tag);
				var tag_view = new views.Tag({ model: tag_model });
				console.log(tag,tag_model,tag_view.$el.html())
				this.$impactTagsList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag categories
		if (impact_tag_categories.length){
			impact_tag_categories.forEach(function(tag){
				this.$impactTagCategoriesList.html('');
				var tag_model = new models.impact_tag.Model(tag);
				var tag_view = new views.Tag({ model: tag_model });
				this.$impactTagCategoriesList.append(tag_view.render().el);
			}, this);
		}

		// Impact tag levels
		if (impact_tag_levels.length){
			impact_tag_levels.forEach(function(tag){
				this.$impactTagLevelsList.html('');
				var tag_model = new models.impact_tag.Model(tag);
				var tag_view = new views.Tag({ model: tag_model });
				this.$impactTagLevelsList.append(tag_view.render().el);
			}, this);
		}

		return this;
	},

	bakeEventGallery: function(){
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

	filterEventsByDateRange: function(dateRange){
		console.log(dateRange)
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
