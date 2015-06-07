views.AA_BaseSettingListItemRecipe = views.AA_BaseSetting.extend({

	tagName: 'li',

	render: function(){
		var template = this.options.template || this.template;
		var parent_el = this.options.parentEl || this.parentEl;

		if (template){
			this.$el.html(template( {} ));
			if (parent_el){
				$(parent_el).append(this.el);
			}
		}

		return this;

	}, 
	
	checkIfNew: function(){
		if (!this.model){
			this.model = new models.recipe.Model(this.default_model_opts);
			this.model.set('name', app.defaults[this.model.get('name')]); // The name is a string of the location on the `apps.default` object because if we store the `default_opts`, then those are undefined at runtime
			collections.recipes.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	}

});