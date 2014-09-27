views.ShowAllRecipes = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-container',

	events: {
		'click': 'setState'
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
		this.styleLayout(true);
		this.filter();
	},

	styleLayout: function(mode){

		// Set the other one to false
		collections.recipes.account_instance.where({viewing: true}).forEach(function(accountRecipe){
			accountRecipe.set('viewing', false);
		});

		// This is either the `all` or the id of the current recipe
		this.$el.find('.drawer-list-outer').toggleClass('active', mode);
		this.$el.find('.inputs-container input').prop('checked', mode);

	},

	filter: function(){
		// Clear everything in our collection, triggering an update on our view and baking of all alerts to the content area
		collections.po.alerts.filters.recipe_id.clearQuery();

		// Clear the hash
		routing.router.navigate('my-recipes');
	},

	deactivate: function(){
		this.styleLayout(false);
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