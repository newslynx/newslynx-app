views.ShowAllRecipes = Backbone.View.extend({

	tagName: 'div',

	className: 'drawer-container',

	events: {
		'click .drawer-list-outer:not(.active)': 'setState'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		// this.listenTo(this.model, 'change:active', this.filter);

	},

	render: function(hasRecipes){
		var tag_markup = templates.drawerMyRecipesPrepFactory({hasRecipes: hasRecipes});

		this.$el.html(tag_markup);
		// Set its state to active on render, if our view variable is set to all
		this.styleLayout(true);
		// this.setState();
		return this;
	},

	setState: function(){
		this.styleLayout(true);
		this.filter();
	},

	styleLayout: function(mode){

		// Set the other one to false
		collections.recipes.instance.where({viewing: true}).forEach(function(accountRecipe){
			accountRecipe.set('viewing', false);
		});

		// This is either the `all` or the id of the current recipe
		this.$el.find('.drawer-list-outer').toggleClass('active', mode);
		this.$el.find('.inputs-container input').prop('checked', mode);

	},

	filter: function(){
		// Pass `all` as the recipe id, which `setActiveAlertsPerRecipe` will figure out what to do with
		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, 'all');

		// Clear the hash
		routing.router.navigate('my-recipes');
	},

	deactivate: function(){
		this.styleLayout(false);
	}



});