views.RecipeEditor = views.AA_BaseRecipe.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation'
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		var recipe_options = $.extend(true, {}, opts.model.options),
				set_event_options = $.extend(true, {}, opts.model.set_event_options),
				required_keys = [];

		var sous_chef_model = collections.sous_chefs.instance.findWhere({slug: opts.model.sous_chef}),
				sous_chef_schema = $.extend(true, {}, sous_chef_model.get('options')),
				set_event_schema = $.extend(true, {}, sous_chef_model.get('set_event_options'));


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

		// // Hydrate impact tags
		// var event_tag_ids = set_event_schema_with_values.set_event_tag_ids;
		// if (event_tag_ids.selected) {
		// 	set_event_schema_with_values.set_event_tag_ids.selected = event_tag_ids.selected.map(function(id){
		// 		return _.findWhere(event_tag_ids.input_options, {id: id})
		// 	});
		// }

		// Store these for use throughout this view
		this.form_schema = recipe_schema_with_values;
		this.event_schema = set_event_schema_with_values;
		this.required_keys = required_keys;

		// Cache some jQuery selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Bake the modal container and form elements
		this.render();
		// // Init the title searcher and pikaday
		this.postRender(null, null, true);
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