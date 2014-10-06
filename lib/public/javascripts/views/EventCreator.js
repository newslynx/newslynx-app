views.EventCreator = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'createEvent'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);


		console.log(options)
		var recipe_default_event = {
			assignees: options.defaults.assignees
		}

		// Add default values to the schema under the `selected` property
		event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, recipe_default_event);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.event_schema = event_creator_schema;

		// Prep the area by creating the modal markup
		this.bakeModal('Create an event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender();
	},

	render: function(){
		var markup = '',
				event_schema = $.extend(true, {}, this.event_schema);

		// Bake the initial form data
		_.each(event_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			impact_tags: [],
			assignees: []
		};

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

		delete settings_obj.undefined;
		delete settings_obj['assignees-selector'];

		var required_keys = [
			'timestamp',
			'assignees',
			'title',
			'what_happened',
			'significance',
			'impact_tags'
			];

		this.validate(required_keys, function(error, description){
			var that = this;
			if (!error){
				console.log('no error')
				new_event_model.save(settings_obj, {
					error: function(model, response, options){
						console.log('error in event creation', response);
						that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: meow@newslynx.org &mdash <em>Merlynne</em>.');
					},
					success: function(model, response, options){
						console.log('saved event', response);

						views.helpers.toggleModal(e);
						that.refresh();
					}
				});
			} else {
				this.printMsgOnSubmit(error, description)
			}

		});


	}

});