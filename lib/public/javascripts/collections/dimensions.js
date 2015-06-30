// This is most closely tied to metrics but it also includes information like `title` and `created` date which are just pieces of data
collections.dimensions = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		metadata: helpers.modelsAndCollections.metadata,

		initialize: function(){
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
			this.metadata('selects', selects);
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

		getSelectsForIsotope: function(){
			var selects = this.cloneMetrics(true),
					selects_for_isotope = {};

			selects.forEach(function(selectInfo){
				var select = {};
				var caster = '';
				if (selectInfo.kind == 'metric'){
					caster = ' parseFloat';
				}
				selects_for_isotope[selectInfo.name] = '[data-'+selectInfo.name+']' + caster;
			});

			return selects_for_isotope;
		}
	})
}