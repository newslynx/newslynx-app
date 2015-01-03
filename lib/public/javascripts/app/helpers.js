app.helpers = {

	drawer: {
		determineBehavior: function(){
			var behavior = 'radio';
			if (models.section_mode.get('mode') == 'compare') {
				behavior = 'checkbox';
			}
			return behavior;
		},
		getAllIds: function(){
			var ids = [];
			// Add all the ids in our loaded articles and set the hash to that
			_.each(this.drawerData, function(drawerDatum) { ids.push(drawerDatum[this.listId]) }, this);
			// Because we're finding the drawer item ids based on the detail items, we might have duplicates, such as in the approval river
			return ids;
		}
	},

	isotope: {
		initCntnr: function(){
			this.$isotopeCntnr = this.$listContainer;
			this.$isotopeCntnr.isotope({
				itemSelector: this.isotopeChild, 
				 masonry: {
		      columnWidth: 400
		    },	
				getSortData: {
					title: '[data-title]',
					timestamp: '[data-timestamp] parseFloat',
					twitter: '[data-twitter] parseFloat',
					facebook: '[data-facebook] parseFloat',
					pageviews: '[data-pageviews] parseFloat',
					avg_time_on_page: '[data-avg_time_on_page] parseFloat',
					per_internal: '[data-per_internal] parseFloat',
					per_external: '[data-per_external] parseFloat',
					subject: '[data-subject-tags] parseFloat',
					impact: '[data-impact-tags] parseFloat'
				}
			});
		},
		clearCntnr: function(){
			if (this.$isotopeCntnr) this.$isotopeCntnr = null;
		},
		addItem: function($el){
			this.$isotopeCntnr.isotope('appended', $el);
		},
		relayout: function(sortBy, sortAscending){
			sortBy = sortBy || 'timestamp';
			if (_.isUndefined(sortAscending)) {
				sortAscending = false;
			}
			app.instance.$isotopeCntnr.isotope({sortBy: sortBy, sortAscending: sortAscending});
			app.instance.$isotopeCntnr.isotope('layout');
		}
	},

	// Used for prepping data for download and conversion into csv
	flattenDataStructures: {
		init: function(dict){
			var converters = this;
			var dict_of_json_ready_csvs = {}; // A dictionary where each key is a csv-compliant flat json list.
			_.each(dict, function(value, key, object){
				// Pass in the topLevelInfo so it can be added to each row. Not the most elegent but it lets us add the cleaned info onto every row in the data
				var top_level_info;
				if (dict_of_json_ready_csvs.topLevelInfo){
					top_level_info = dict_of_json_ready_csvs.topLevelInfo[0];
				}
				dict_of_json_ready_csvs[key] = converters[key](value, top_level_info);
			});
			return dict_of_json_ready_csvs;
		},
		topLevelInfo: function(info){
			// Convert the authors list from an array to a pipe-delimited string
			info.article_datetime = helpers.templates.fullIsoDate(info.article_timestamp);
			info.article_authors = info.article_authors.join('|');
			info.article_subject_tags = info.article_subject_tags.map(function(tag){ return tag.name; }).join('|');
			info.article_impact_tags = info.article_impact_tags.map(function(tag){ return tag.name; }).join('|');
			info.article_impact_tag_categories = info.article_impact_tag_categories.map(function(tag){ return tag.name; }).join('|');
			info.article_impact_tag_levels = info.article_impact_tag_levels.map(function(tag){ return tag.name; }).join('|');
			info.article_links = info.article_links.join('|');
			info.article_entities = info.article_entities.join('|');
			info.article_keywords = info.article_keywords.join('|');
			return [info];
		},
		tweets: function(tweets, topLevelInfo){
			var flat_tweets = [];
			// Flatten and remove extraneous elements from these tweet objects so they can each be a row in a csv
			tweets.forEach(function(tweet){
				var obj = {};
				// Copy everything and then flatten the multi-dimensional elements
				_.extend(obj, tweet);
				obj.datetime = helpers.templates.fullIsoDate(tweet.timestamp);
				obj.hashtags = obj.hashtags.join('|');
				obj.img_urls = obj.img_urls.join('|');
				obj.story_ids = obj.story_ids.join('|');
				obj.urls = tweet.urls.join('|');
				obj.user_mentions = tweet.user_mentions.join('|');
				// Add top level info at the end
				_.extend(obj, topLevelInfo);
				flat_tweets.push(obj);
			});
			return flat_tweets;
		},
		timeseries: function(stats, topLevelInfo){
			var augmented_stats = [];
			stats.forEach(function(stat){
				var obj = {};
				// Copy everything and then add datetime
				_.extend(obj, stat);
				obj.datetime = helpers.templates.fullIsoDate(stat.timestamp);
				// Add top level info at the end
				_.extend(obj, topLevelInfo);
				augmented_stats.push(obj);
			});
			return augmented_stats;
		},
		promotions: function(promotions, topLevelInfo){
			var augmented_promotions = [];
			promotions.forEach(function(promotion){
				var obj = {};
				_.extend(obj, promotion);
				if (promotion.story_ids){
					obj.story_ids = promotion.story_ids.join('|');
				}
				_.extend(obj, topLevelInfo);
				augmented_promotions.push(obj);
			});
			return augmented_promotions;
		},

	}
}