views.RecipeCreator = views.AA_BaseRecipe.extend({

	events: _.extend({
		// 'submit form': 'createRecipe',
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		var sous_chef = opts.sousChef,
				recipe_info = this.separateSchemaFromEvent(sous_chef.options);

		var recipe_schema = recipe_info.settingsInfo,
				set_event_schema = recipe_info.eventInfo,
				sous_chef_name = sous_chef.slug;

		// Cache CSS selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Add the sous_chef name as a hidden field
		recipe_schema.sous_chef = {
			input_type: 'hidden',
			default: sous_chef_name,
			required: true
		};

		// Delete tag_ids since we got that covered in the default event
		delete recipe_schema.tag_ids;

		// Make an object of our selected vals based on defaults
		var recipe_vals = {};
		_.each(recipe_schema, function(val, key){
			if (val.default){
				recipe_vals[key] = val.default;
			}
		});

		// // Set the defaults on this object to the selected val
		// // And exract a list of required keys
		// _.each(recipe_schema, function(val, key){
		// 	if (val.default){
		// 		val.selected = val.default;
		// 	}
		// 	// if (val.required){
		// 	// 	required_keys.push(key);
		// 	// }
		// });


		this.recipe_info = {
			schema: recipe_schema,
			vals: recipe_vals
		};
		this.event_info = {
			schema: set_event_schema,
			vals: {}
		};
		this.form_info = {
			schema: _.extend({}, recipe_schema, set_event_schema),
			vals: _.extend({}, recipe_vals)
		};

		// Save the values we'll use throughout the view
		// this.form_schema = recipe_schema;
		// this.event_schema = set_event_schema;
		// this.full_schema = $.extend(true, {}, recipe_schema, set_event_schema);
		// this.required_keys = required_keys;

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher, set the article searcher assigne mode to set event
		this.postRender({search: true});
		this.updateScheduleByLayout('minutes');

		return this;
	},

	render: function(){
		var markup = '',
				recipe_info = this.recipe_info,
				default_event_markup

		// Bake the initial form data
		_.each(recipe_info.schema, function(fieldData, fieldName){
			if (recipe_info.vals[fieldName]){
			console.log('baking',fieldName, recipe_info.vals[fieldName])
				
			}
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, recipe_info.vals[fieldName]);
		}, this);

		this.$form.prepend(markup);

		var default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		return this;
	},

	renderDefaultEvent: function(){
		var markup = '',
				set_event_info = this.event_info;

		// Bake the initial form data
		_.each(set_event_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, true);
		}, this);

		return markup
	}


});