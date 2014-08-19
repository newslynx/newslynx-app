var collections = {
	init: {
		articles: function(){
			// Tags
			this.subject_tags.instance = new this.subject_tags.Collection(pageData.org.subject_tags);
			this.impact_tags.instance = new this.impact_tags.Collection(pageData.org.impact_tags);
			// Article summaries
			this.drawer_items.instance = new this.drawer_items.Collection( pageData.articleSummaries );
			// This will populate based on our selection
			this.row_items.instance = new this.row_items.Collection([]);
			// This will also populate based on our selection
			this.detail_items.instance = new this.detail_items.Collection([]);
		},
		"approval-river": function(){
			// Recipes
			this.drawer_items.instance = new this.drawer_items.Collection(pageData.accountRecipes);
			// Recipes creators
			this.drawer_items.instance_static = new this.drawer_items.Collection(pageData.recipeSchemas);
			// This will populate based on our selection of drawer items
			this.detail_items.instance = new this.detail_items.Collection([]);
		},
		settings: function(){
			// Nothing to see here folks
		}
	},
	impact_tags: {
		"instance": null,
		"Collection": Backbone.Collection.extend({
			model: models.tags.Model,
			getTrue: modelCollectionHelpers.getTrue
		})
	},
	subject_tags: {
		"instance": null,
		"Collection": Backbone.Collection.extend({
			model: models.tags.Model,
			getTrue: modelCollectionHelpers.getTrue
		})
	},
	drawer_items: {
		"instance": null,
		"instance_static": null,
		"Collection": Backbone.Collection.extend({
			model: models.drawer_list_item.Model,
			getTrue: modelCollectionHelpers.getTrue,
			zeroOut: modelCollectionHelpers.zeroOut,
			setBoolByIds: modelCollectionHelpers.setBoolByIds,
		})
	},
	// TODO, refactor to remove ununed collection functions
	row_items: {
		"instance": null,
		"Collection": Backbone.Collection.extend({
			model: models.detail_item.Model,
			getTrue: modelCollectionHelpers.getTrue,
			zeroOut: modelCollectionHelpers.zeroOut
		})
	},
	// TODO, refactor to remove ununed collection functions
	detail_items: {
		"instance": null,
		"Collection": Backbone.Collection.extend({
			model: models.detail_item.Model,
			getTrue: modelCollectionHelpers.getTrue,
			zeroOut: modelCollectionHelpers.zeroOut
		})
	}
}

module.exports = collections;