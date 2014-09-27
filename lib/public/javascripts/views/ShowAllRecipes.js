views.ShowAllRecipes = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-container',

	events: {
		'click': 'toggle'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		// this.listenTo(this.model, 'change:active', this.filter);

	},

	render: function(hasRecipes){
		var tag_markup = templates.showAllRecipesFactory({hasRecipes: hasRecipes});

		this.$el.html(tag_markup);
		// Set its state to active on render, if our view variable is set to all
		this.setState();
		return this;
	},

	setState: function(){
		this.styleLayout();
		this.filter();
	},

	styleLayout: function(){
		// This is either the `all` or the id of the current recipe
		var active_recipe = app.instance.viewing_recipe_id,
				current_mode_selection_state = (active_recipe == 'all');

				console.log(active_recipe)

		this.$el.find('.drawer-list-outer').toggleClass('active', current_mode_selection_state);
		this.$el.find('.inputs-container input').prop('checked', current_mode_selection_state);

	},

	filter: function(){
		
	}

	// filter: function(tagModel, isActive){
	// 	var po_collection = tagModel.collection.metadata('po_collection'), // This can apply to multiple po collection instances
	// 			filter = tagModel.collection.metadata('filter'),
	// 			query_value = tagModel.get('id') || tagModel.get('name'); // For tags, this is the id, but for tag attributes it's the name

	// 	// console.log(po_collection, filter, query_value)
	// 	// If it's active set the query to the value of this tag
	// 	if (isActive){
	// 		// If that filter already has a condition, then chain its match set with `and`
	// 		collections.po[po_collection].filters[filter].intersectQuery(query_value);
	// 	} else {
	// 		// If it's not active then clear the query from the PourOver match set.
	// 		collections.po[po_collection].filters[filter].removeSingleQuery(query_value);
	// 	}
	// 	return this;
	// }



});