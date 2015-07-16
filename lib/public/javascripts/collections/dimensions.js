// This is most closely tied to metrics but it also includes information like `title` and `created` date which are just pieces of data
collections.dimensions = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		metadata: helpers.modelsAndCollections.metadata,

		initialize: function(){
			// TODO, this should be saved on the user settings list, once that exists
			var selects = [
				{
					name: 'title',
					kind: 'text'
				},{
					name: 'created',
					kind: 'date'
				},{
					name: 'ga_pageviews',
					kind: 'metric'
				},{
					name: 'twitter_shares',
					kind: 'metric'
				},{
					name: 'facebook_likes',
					kind: 'metric'
				},{
					name: 'facebook_shares',
					kind: 'metric'
				},{
					name: 'facebook_comments',
					kind: 'metric'
				},{
					name: 'subject_tags',
					kind: 'bars'
				},{
					name: 'impact_tags',
					kind: 'bars'
				}
			];


			var sortable_dimensions = [	'divider-article info'
																	'created',
																	'title',
																	'updated',
																	'divider-social',
																	'twitter_followers',
																	'twitter_shares',
																	'facebook_comments',
																	'facebook_likes',
																	'facebook_shares',
																	'googleplus_shares',
																	'linkedin_shares',
																	'pinterest_shares',
																	'reddit_downvotes',
																	'reddit_upvotes',
																	'fb_page_likes',
																	'divider-google analytics',
																	'ga_avg_time_on_page',
																	'ga_entrances',
																	'ga_exits',
																	'ga_pageviews',
																	'ga_pageviews_by_domain',
																	'ga_pageviews_mobile',
																	'ga_pageviews_tablet',
																	'ga_per_external',
																	'ga_total_time_on_page',
																	'divider-impact levels',
																	'institution_level_events',
																	'community_level_events',
																	'individual_level_events',
																	'internal_level_events',
																	'media_level_events',
																	'divider-impact categories',
																	'change_category_events',
																	'citation_category_events',
																	'achievement_category_events',
																	'promotion_category_events',
																	'other_category_events',
																	'total_events'
																]

			this.metadata('selects', selects);
			this.metadata('sortable-dimensions', sortable_dimensions);
		},

		cloneMetrics: function(getAll){ // We're lazy so give this a flag if we want to grab all
			var metrics = [];
			this.metadata('selects').forEach(function(select){
				var metric;
				if (select.kind == 'metric' || getAll){
					metric = _.clone(select); // Beware, we are expecting a non-nested object here
					metrics.push(metric);
				}
			});
			return metrics;
		},

		getSelectDimensions: function(){
			var selects_list = this.cloneMetrics(true),
					dimension_selects = [],
					that = this;

			selects_list.forEach(function(selectInfo){
				var select_name = selectInfo.name,
						dimension_model = that.findWhere({name: select_name}),
						dimension_json;
						
				if (dimension_model){
					dimension_json = _.clone(dimension_model.toJSON()); // Beware, we are expecting a non-nested object here
					_.extend(dimension_json, selectInfo);
					dimension_selects.push(dimension_json);
				}
			});

			return dimension_selects;

		},

		formatSelectsForIsotope: function(){
			var selects = this.cloneMetrics(true),
					selects_for_isotope = {};

			selects.forEach(function(selectInfo){
				var select = {};
				var caster = '';
				if (selectInfo.kind == 'metric' || selectInfo.name == 'impact_tags'){
					caster = ' parseFloat';
				}
				selects_for_isotope[selectInfo.name] = '[data-'+selectInfo.name+']' + caster;
			});

			return selects_for_isotope;
		},

		getSortableDimensions: function(){
			var sd_names = this.metadata('sortable-dimensions'),
			    sortable_dimensions = [];

			sd_names.forEach(function(sdName){
				var sorter = this.findWhere({name: sdName});

				if ( /^divider-/.test(sdName) ) {
					sorter = {
						name: sdName.replace('divider-', '')+'...',
						sort_name: '',
						disabled: true
					};
					sortable_dimensions.push({
						name: ' ',
						sort_name: '',
						disabled: true
					});
				} else if (sorter) {
					sorter = sorter.toJSON();
				}

				if (sorter){
					sortable_dimensions.push(sorter);
				}

			}, this);

			return sortable_dimensions;
		}

	})
}