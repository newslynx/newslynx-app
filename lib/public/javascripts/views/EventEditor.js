views.EventEditor = views.AA_BaseForm.extend({

	events: _.extend({
		'change input': 'printData',
		'submit form': 'createEvent',
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Add the passed in options
		// _.extend(this, _.pick(options, 'assignee'));
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		// Save a fresh copy under `schema`
		var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);

		// Don't allow for a change in assignment
		// TODO, maybe we do allow this later but for now it's complicated
		delete event_creator_schema.assignees;

		// TEMPORARY, convert the `what_happened` and `significance` to `paragraph` types
		// Remove this when you refactor the alert form
		event_creator_schema.what_happened.type = 'paragraph';
		event_creator_schema.significance.type = 'paragraph';
		// And timestamp to timestamp
		event_creator_schema.timestamp.type = 'timestamp';

		// Add default values to the schema under the `selected` property, in this case assignee
		event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, options.defaults);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.schema = event_creator_schema;

		// Prep the area by creating the modal markup
		this.bakeModal('Edit this event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday, pass in true for either to disable in that order
		this.postRender(true);
	},

	render: function(){
		var markup = '',
				event_data = $.extend(true, {}, this.schema);

		// Bake the initial form data
		_.each(event_data, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons(true);

		this.$form.html(markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			impact_tags: [],
			assignees: []
		};

		return this
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
		console.log(this.event_data);
		
		var settings_obj = this.event_data;
		var new_event_model = new models.event.Model; 

		new_event_model.save(settings_obj, {
			error: function(model, response, options){
				console.log('error in event creation', response);

			},
			success: function(model, response, options){
				console.log('saved event', response);

				views.helpers.toggleModal(e);
			}
		});
	}

});