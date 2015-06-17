views.RecipeCreator = views.AA_BaseForm.extend({

	events: _.extend({
		// 'submit form': 'createRecipe',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(opts){
		var sous_chef = opts.sousChef,
				recipe_schema = sous_chef.options,
				default_event_schema = sous_chef.default_event,
				sous_chef_name = sous_chef.slug;

		// Cache CSS selectors
		this.$form = this.$el.find('form');
		this.$defaultEvents = this.$el.find('.default-event-container');

		// Add the sous_chef name as a hidden field
		recipe_schema.sous_chef = {
			input_type: 'hidden',
			selected: sous_chef_name
		};
		// Set the defaults on this object to the selected val
		_.each(recipe_schema, function(val, key){
			if (val.default){
				val.selected = val.default;
			}
		});

		console.log(opts)

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

		this.$form.prepend(markup);

		var default_event_markup = this.renderDefaultEvent();

		this.$defaultEvents.html(default_event_markup);

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

	getSettings: function(setDefaultEvent){

		// Skip any that we've decided are skippable
		var $form_selector = this.$el.find('form :input[data-serialize-skip!="true"]');

		// If we don't want to set default event options
		// Only include the non-default-evnt input fields in our serializer when creating the json
		if (!setDefaultEvent){
			$form_selector = $form_selector.filter(function(){
				return $(this).attr('data-is-default-event') == 'false';
			});
		}

		var form_options = $form_selector.serializeJSON();

		return form_options;

	}

});