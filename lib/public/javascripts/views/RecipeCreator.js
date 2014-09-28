views.RecipeCreator = views.AA_BaseForm.extend({

	events: _.extend({
		// 'submit form': 'createRecipe',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		this.recipe_schema = opts.recipeSchema.schema;
		this.event_schema = opts.recipeSchema.default_event;

		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');
		// var recipe_creator_schemas = $.extend(true, {}, pageData.eventCreatorSchema);

		// Add default values to the schema under the `selected` property
		// event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, options.defaults);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.schema = event_creator_schema;


		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.renderDefaultEvent();
		this.postRender();

		return this;
	},

	render: function(){
		var markup = '',
				recipe_schema = this.recipe_schema,
				default_event_markup

		// Bake the initial form data
		_.each(recipe_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);


		// markup += this.bakeButtons();

		this.$form.prepend(markup);

		default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);
		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			impact_tags: [],
			assignees: [],
			default_event: {}
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

	getSettings: function(setDefaultEvent){
		// e.preventDefault();
		// console.log(this.event_data);

		console.log(setDefaultEvent)

		this.$el.find('.form-row-input-container select').each(function(i,el){
			$(el).trigger('change')
		})

		var settings_obj = this.event_data;

		if (setDefaultEvent){
			settings_obj.default_event = {
				assignees: settings_obj.assignees,
				title: settings_obj.title,
				what_happened: settings_obj.what_happened,
				significance: settings_obj.significance,
				impact_tags: settings_obj.impact_tags
			};
			
		}

		delete settings_obj.assignees;
		delete settings_obj.title;
		delete settings_obj.what_happened;
		delete settings_obj.significance;
		delete settings_obj.impact_tags

		return settings_obj;
		// var new_recipe_creator_model = new models.recipe_creator.Model; 


		// console.log(new_recipe_creator_model.url())
		// console.log(new_recipe_creator_model.toJSON())

		// new_recipe_creator_model.save(settings_obj, {
		// 	error: function(model, response, options){
		// 		console.log('error in recipe creatin', response);
		// 		that.flashResult('error');
		// 	},
		// 	success: function(model, response, options){
		// 		console.log('saved recipe', response);
		// 		that.flashResult(null);
		// 	}
		// });

	}

});