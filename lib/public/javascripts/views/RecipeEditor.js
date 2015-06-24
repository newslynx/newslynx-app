views.RecipeEditor = views.AA_BaseRecipe.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation' // Stop propagation so that clicks in our modal form don't trigger a click on the drawer item
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		console.log('here',opts.model.options.set_event_tag_ids[0])
		var recipe_info = this.separateSchemaFromEvent(opts.model.options),
				recipe_options = recipe_info.settingsInfo,
				set_event_options = recipe_info.eventInfo,
				required_keys = [];

				// console.log(recipe_info)

		var sous_chef_options = collections.sous_chefs.instance.findWhere({slug: opts.model.sous_chef}).get('options'),
				sous_chef_info = this.separateSchemaFromEvent(sous_chef_options),
				sous_chef_schema = sous_chef_info.settingsInfo,
				set_event_schema = sous_chef_info.eventInfo;

		// console.log(opts.model)


		// Add the name manually
		var recipe_schema_with_values = _.extend({
				name: {
					input_type: 'text',
					selected: opts.model.name,
					required: true
				}
			},
			this.combineFormSchemaWithVals(sous_chef_schema, recipe_options)
			);

		// Set our list of required keys
		_.each(recipe_schema_with_values, function(val, key){
			if (val.required){
				required_keys.push(key);
			}
		});

		var set_event_schema_with_values = this.combineFormSchemaWithVals(set_event_schema, set_event_options);

		// Store these for use throughout this view
		this.form_schema = recipe_schema_with_values;
		this.event_schema = set_event_schema_with_values;
		this.full_schema = $.extend(true, {}, recipe_schema_with_values, set_event_schema_with_values);
		this.required_keys = required_keys;

		// Cache some jQuery selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Bake the modal container and form elements
		this.render();
		// // Init the title searcher, disable pikaday
		this.postRender({search: true});
		this.updateScheduleByLayout(); // calling this with nothing will trigger a change event on the dropdown which will trigger a layout

		return this;
	},

	render: function(){
		var markup = '',
				recipe_schema = this.form_schema,
				default_event_markup;

		// Bake the initial form data
		_.each(recipe_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		this.$form.prepend(markup);

		default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		return this;
	},

	renderDefaultEvent: function(){
		var markup = '',
				default_event_schema = this.event_schema;

		// Bake the initial form data
		_.each(default_event_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, 'default_event');
		}, this);

		return markup
	},
	
	stopPropagation: function(e){
		e.stopPropagation();

		return this;
	}

});