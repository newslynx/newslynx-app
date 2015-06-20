views.RecipeEditor = views.AA_BaseRecipe.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation'
	}, views.AA_BaseRecipe.prototype.events),

	initialize: function(opts){
		var recipe_settings = $.extend(true, {}, opts.model.options),
				default_event_settings = opts.model.default_event || {
					set_event_content_items: [],
					set_event_tag_ids: recipe_settings.set_event_tag_ids
				},
				required_keys = [];

		var sous_chef_model = collections.sous_chefs.instance.findWhere({slug: opts.model.sous_chef}),
				sous_chef_schema = $.extend(true, {}, sous_chef_model.get('options')),
				default_event_schema = $.extend(true, {}, sous_chef_model.get('default_event'));


		// Add the name manually
		var recipe_schema = _.extend({
				name: {
					input_type: 'text',
					selected: opts.model.name,
					required: true
				}
			},
			this.combineFormSchemaWithVals(sous_chef_schema, recipe_settings)
			);

		if (recipe_schema.set_event_tag_ids){
			// Do some massaging, we don't want this on the main settings, but rather the default, if it exists
			default_event_settings.set_event_tag_ids.selected = recipe_schema.set_event_tag_ids.selected;
			delete recipe_schema.set_event_tag_ids;
		}

		// Set our list of required keys
		_.each(recipe_schema, function(val, key){
			if (val.required){
				required_keys.push(key);
			}
		});

		var recipe_default_event_schema = this.combineFormSchemaWithVals(default_event_schema, default_event_settings);

		// console.log(JSON.parse(JSON.stringify(sous_chef_default_event)))
		// TODO, figure this out
		// Hydrate default_event selected assignees with full article information
		// if (sous_chef_default_event.assignees.selected){
		// 	sous_chef_default_event.assignees.selected = sous_chef_default_event.assignees.selected.map(function(id){
		// 		return _.findWhere(pageData.articleSkeletons, {id: id})
		// 	});
		// }

		// TODO, figure this out
		// Also hydrate impact tags
		// if (sous_chef_default_event.impact_tags.selected) {
		// 	sous_chef_default_event.impact_tags.selected = sous_chef_default_event.impact_tags.selected.map(function(id){
		// 		return _.findWhere(sous_chef_default_event.impact_tags.options, {id: id})
		// 	});
		// }


		// Store these for use throughout this view
		this.form_schema = recipe_schema;
		this.event_schema = recipe_default_event_schema;
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

				// console.log(recipe_schema)

		// Bake the initial form data
		_.each(recipe_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		this.$form.prepend(markup);

		default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		// // Preload with empty arrays for impact_tags and assignees
		// // Selected values will be added on load
		// this.event_data = {
		// 	content_items: [],
		// 	tag_ids: []
		// };


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