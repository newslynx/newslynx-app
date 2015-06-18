views.RecipeEditor = views.AA_BaseForm.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		var recipe_settings = $.extend(true, {}, opts.model.options),
				default_event_settings = opts.model.default_event || {
					content_item_ids: [],
					tag_ids: recipe_settings.tag_ids
				};

		var sous_chef_model = collections.sous_chefs.instance.findWhere({slug: opts.model.sous_chef}),
				sous_chef_schema = $.extend(true, {}, sous_chef_model.get('options')),
				default_event_schema = $.extend(true, {}, sous_chef_model.get('default_event'));


		// Add the name manually
		var recipe_schema = _.extend({
				name: {
					input_type: 'text',
					selected: opts.model.name
				}
			},
			this.combineFormSchemaWithVals(sous_chef_schema, recipe_settings)
			);

		if (recipe_schema.tag_ids){
			// Do some massaging, we don't want this on the main settings, but rather the default, if it exists
			default_event_settings.tag_ids.selected = recipe_schema.tag_ids.selected;
			delete recipe_schema.tag_ids;
		}

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
		this.recipe_schema = recipe_schema;
		this.event_schema = recipe_default_event_schema;

		// Cache some jQuery selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Bake the modal container and form elements
		this.render();
		// // Init the title searcher and pikaday
		this.postRender();

		return this;
	},

	render: function(){
		var markup = '',
				recipe_schema = this.recipe_schema,
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
		// 	content_item_ids: [],
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

	// formListToObject: function(){
	// 	var form_data = this.event_creator_options;
	// 	var form_obj = {
	// 		impact_tags: [],
	// 		assignees: []
	// 	};
	// 	form_data.forEach(function(formItem){
	// 		var name = formItem.name,
	// 				form_value = formItem.selected;
	// 		if (name != 'impact_tags' && name != 'assignees'){
	// 			form_obj[name] = form_value;
	// 		} else {
	// 			form_obj[name].push(form_value);
	// 		}
	// 	});
	// 	return form_obj;
	// },


	// getSettings: function(){

	// 	this.$el.find('.form-row-input-container select,.form-row-input-container input').each(function(i,el){
	// 		$(el).trigger('change');
	// 	})

	// 	// Don't give this back
	// 	delete this.event_data['assignees-selector'];
	// 	// YOLO
	// 	delete this.event_data.undefined;

	// 	return this.event_data;

	// },

	stopPropagation: function(e){
		e.stopPropagation();

		return this;
	}

});