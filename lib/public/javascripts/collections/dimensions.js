// This is most closely tied to metrics but it also includes information like `title` and `created` date which are just pieces of data
collections.dimensions = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		metadata: helpers.modelsAndCollections.metadata,

		fetchSelects: function(cb){
			var self = collections.dimensions.instance

			var q = queue()

			q.defer(d3.json, '/api/_VERSION/me/settings')
			q.defer(d3.json, 'data/selects.json')

			q.await(cb)

		},

		setSelects: function(cb){
			var self = collections.dimensions.instance
			// Fetch them, see if any are missing and if so, load those from file
			self.fetchSelects(function(err, dimensionsSelects, selectsDefaults){
				var groups = ['select-dimensions', 'sortable-dimensions', 'select-timeseries']
				var settings
				if (err){
					console.log('Error getting selects', err)
				} else {
					settings = groups.map(function(group){
						var setting_from_api = _.findWhere(dimensionsSelects, {name: group})
						var setting
						if (!setting_from_api) {
							setting = selectsDefaults[group]
						} else {
							// Set the id of the local model via a naming convention so that when we save back, we will send PATCH and not POST
							models['user_' + group.replace(/-/g, '_')].fetch()
							setting = setting_from_api.value
						}
						return setting
					})

					self.metadata('selects', settings[0]);
					self.metadata('sortable-dimensions', settings[1]);
					self.metadata('select-timeseries', settings[2]);

					cb(null)
				}

			})
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
				} else {
					console.log('ERROR: No dimension model found for', select_name, 'in', that.toJSON())
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