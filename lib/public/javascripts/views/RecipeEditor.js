views.RecipeEditor = views.AA_BaseForm.extend({

	events: _.extend({
		'click .modal-outer': 'stopPropagation',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		var sous_chef = opts.model.sous_chef,
				recipe_settings = opts.model.settings,
				default_event_settings = opts.model.default_event;

		var sous_chef_model = $.extend(true, {}, _.findWhere(pageData.sousChefs, {slug: sous_chef}) ),
				sous_chef_schema = sous_chef_model.options,
				sous_chef_default_event = sous_chef_model.default_event || {assignees: [], impact_tags: []}; // TODO, figure out the default_event situation 

		// Add default values to the schema, which are under the `selected` property
		sous_chef_schema = this.combineFormSchemaWithVals(sous_chef_schema, recipe_settings);
		// And add the name manually
		sous_chef_schema.name.selected = opts.model.name;
		sous_chef_default_event = this.combineFormSchemaWithVals(sous_chef_default_event, default_event_settings);

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
		this.sous_chef_schema = sous_chef_schema;
		this.event_schema = sous_chef_default_event;

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
				sous_chef_schema = this.sous_chef_schema,
				default_event_markup;

		// Bake the initial form data
		_.each(sous_chef_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		this.$form.prepend(markup);

		default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			impact_tags: [],
			assignees: []
		};


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

	formListToObject: function(){
		var form_data = this.event_creator_options;
		var form_obj = {
			impact_tags: [],
			assignees: []
		};
		form_data.forEach(function(formItem){
			var name = formItem.name,
					form_value = formItem.selected;
			if (name != 'impact_tags' && name != 'assignees'){
				form_obj[name] = form_value;
			} else {
				form_obj[name].push(form_value);
			}
		});
		return form_obj;
	},


	getSettings: function(){

		this.$el.find('.form-row-input-container select,.form-row-input-container input').each(function(i,el){
			$(el).trigger('change');
		})

		// Don't give this back
		delete this.event_data['assignees-selector'];
		// YOLO
		delete this.event_data.undefined;

		return this.event_data;

	},

	stopPropagation: function(e){
		e.stopPropagation();

		return this;
	}

});