views.RecipeDrawerStatic = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer:not(active)': 'filter',
	},

	initialize: function(){
		this._subviews = [];

		this.listenTo(this.model, 'filter', this.filter);
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);

		return this;
	},

	render: function(){
		if (this._time_picker){
			this._time_picker.destroy();
		}

		var drawer_list_item_markup = templates.recipeStaticFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		this.$form = this.$el.find('form');

		return this;
	},

	filter: function(){
		var that = this,
				recipe_id = this.model.id;

		app.instance.content.setActiveAlertsPerRecipe.call(app.instance, recipe_id);
		app.instance.show_all_view.deactivate();
		this.model.set('viewing', true);
		// Set the hash
		routing.router.navigate('my-recipes/manual');

		return this;

	},

	killEvent: function(e){
		e.stopPropagation();
	},

	setActiveCssState: function(model, viewing){

		this.$el.find('.drawer-list-outer').toggleClass('active', viewing);
		this.$el.find('.inputs-container input').prop('checked', viewing);

		return this;
	}


});