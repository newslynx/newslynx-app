views.RecipeCreator = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'createEvent',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		this.schema = opts.recipeSchema.schema;
		this.default_event = opts.recipeSchema.default_event;
		// var recipe_creator_schemas = $.extend(true, {}, pageData.eventCreatorSchema);

		// Add default values to the schema under the `selected` property
		// event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, options.defaults);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.schema = event_creator_schema;

		// Prep the area by creating the modal markup
		this.bakeModal('Create a recipe');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		// this.postRender();

		return this;
	},

	render: function(){
		var markup = '',
				recipe_schema = this.schema;

		// Bake the initial form data
		_.each(recipe_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		// this.event_data = {
		// 	impact_tags: [],
		// 	assignees: []
		// };

		return this;
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

	createEvent: function(e){
		e.preventDefault();
		// console.log(this.event_data);
		
		var settings_obj = this.event_data;
		var new_event_model = new models.event.Model; 

		console.log(new_event_model.url())
		console.log(new_event_model.toJSON())

		// new_event_model.save(settings_obj, {
		// 	error: function(model, response, options){
		// 		console.log('error in event creation', response);

		// 	},
		// 	success: function(model, response, options){
		// 		console.log('saved event', response);

		// 		views.helpers.toggleModal(e);
		// 	}
		// });
	}

});