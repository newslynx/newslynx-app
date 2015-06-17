views.RecipeCreator = views.AA_BaseForm.extend({

	events: _.extend({
		// 'submit form': 'createRecipe',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		var recipe_schema = opts.recipeSchema.options;
		var default_event_schema = opts.recipeSchema.default_event;

		// Cache CSS selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Set the defaults on this object to the selected val
		_.each(recipe_schema, function(val, key){
			if (val.default){
				val.selected = val.default;
			}
		})

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.schema = event_creator_schema;


		this.recipe_schema = recipe_schema;
		this.event_schema = default_event_schema;
		// Bake the modal container and form elements
		this.render();
		// Init the title searcher
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

		var default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);
		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		// this.event_data = {
		// 	impact_tags: [],
		// 	assignees: []
		// };

		return this;
	},

	renderDefaultEvent: function(){
		var markup = '',
				default_event_schema = this.event_schema;

		// Bake the initial form data
		_.each(default_event_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, true);
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

	getSettings: function(setDefaultEvent){

		// this.$el.find('.form-row-input-container select').each(function(i,el){
		// 	$(el).trigger('change');
		// })
		// var form_selector = this.$form;
		var $form_selector = this.$el.find('form :input[data-serialize-skip!="true"]');

		// If we don't want to set default event options
		// Only include the non-default-evnt input fields in our serializer when creating the json
		if (!setDefaultEvent){
			$form_selector = $form_selector.filter(function(){
				return $(this).attr('data-is-default-event') == 'false';
			});
			// $form_selector = this.$el.find('form :input[data-is-default-event="false"]');
		}

		var form_options = $form_selector.serializeJSON();

		window.m = form_options;
		console.log(form_options)

		// // Don't give this back
		// delete this.event_data['assignees-selector'];

		return form_options;
		// return this.event_data;

	}

});