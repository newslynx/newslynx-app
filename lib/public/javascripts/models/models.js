var models = {
	init: {
		articles: function(){
			// Keep track of whether we're in single view or comparison view
			this.section_mode.instance = new this.section_mode.Model().set('mode', 'single');
		},
		"approval-river": function(){
			// Keep track of whether we're in `my-recipes or 'create-new' view
			this.section_mode.instance = new this.section_mode.Model().set('mode', 'my-recipes');
		},
		settings: function(){
			this.org.instance = new this.org.Model(pageData.org);
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
		"Model": Backbone.Model.extend({
			defaults: {
				viewing: false,
			},
			toggle: modelCollectionHelpers.toggle
		})
	},
	row_item: {
		"Model": Backbone.Model.extend({
			url: '/article-aggregate'
		})
	},
	detail_item: {
		"Model": Backbone.Model.extend({
			url: '/article-detail'
		})
	},
	river_item: {
		"Model": Backbone.Model.extend({
			url: '/river-item'
		})
	},
	// Article models
	tags: {
		"Model": Backbone.Model.extend({
			defaults: {
				active: false
			},
			toggle: modelCollectionHelpers.toggle
		})
	},
	// Settings
	org: {
		"Model": Backbone.Model.extend({
			urlRoot: '/api/organization/settings'
		})
	}
}

module.exports = models;