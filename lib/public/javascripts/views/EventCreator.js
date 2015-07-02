views.EventCreator = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'saveModal' // All other forms are filled out by their parent view, but the parent view is the `articleDetail` and that is already cluttered
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Add the passed in options
		// _.extend(this, _.pick(options, 'assignee'));
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		// Save a fresh copy under `schema`
		var event_creator_schema = _.clone(pageData.eventCreatorSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.full_info = {
			schema: event_creator_schema,
			vals: options.model
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Create an event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});
	},

	render: function(){
		var markup = '',
				full_info = this.full_info;

		// Bake the initial form data
		_.each(full_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, full_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();

		var self = this;

		var form_data = this.getSettings();

		this.validateNew(this.full_info.schema, form_data, function(err, msg){
			if (!err){
				self.toggleBtnsDisabled();

				// Instead of a save, this should be a create
				this.collection.create(form_data, {
					wait: true,
					error: function(model, response, options){
						console.log('Server error on event edit', response);
						var err = response.responseJSON;
						console.log(response)

						self.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
						self.toggleBtnsDisabled();
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						console.log(response)

						// self.render();
						// Clear submit message
						self.printMsgOnSubmit(false, '');
						// Close the modal
						self.toggleModal(e);
						self.toggleBtnsDisabled();

					}
				});

				// self.model.save(form_data, {
				// 	error: function(model, response, options){
				// 		console.log('Server error on event edit', response);
				// 		var err = response.responseJSON;
				// 		// TODO, test
				// 		self.printMsgOnSubmit(true, 'Error '+err.status+': ' + err.message.replace(/\n/g, '<br/><br/>'));
				// 	},
				// 	success: function(model, response, options){
				// 		// Re-render view with updates to this model

				// 		self.render();
				// 		// Clear submit message
				// 		self.printMsgOnSubmit(false, '');
				// 		// Close the modal
				// 		self.toggleModal(e);
				// 	}
				// });
			} else {
				self.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	},

	toggleBtnsDisabled: function(){
		this.$form.find('.buttons-container').toggleClass('disabled');
	}
	// initialize: function(options){
	// 	// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
	// 	var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);


	// 	var recipe_default_event = {
	// 		assignees: options.defaults.assignees
	// 	};

	// 	// Add default values to the schema under the `selected` property
	// 	event_creator_schema = this.combineFormSchemaWithVals(event_creator_schema, recipe_default_event);

	// 	// Store this on the schema with this article's information on the view
	// 	// We will re-render the view on form submit, rendering makes a copy of these initial settings
	// 	this.event_schema = event_creator_schema;

	// 	// Prep the area by creating the modal markup
	// 	this.bakeModal('Create an event');

	// 	// Bake the modal container and form elements
	// 	this.render();
	// 	// Init the title searcher and pikaday
	// 	this.postRender();
	// },

	// render: function(){
	// 	var markup = '',
	// 			event_schema = $.extend(true, {}, this.event_schema);

	// 	// Bake the initial form data
	// 	_.each(event_schema, function(fieldData, fieldName){
	// 		markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
	// 	}, this);

	// 	markup += this.bakeButtons();

	// 	this.$form.html(markup);

	// 	// Preload with empty arrays for impact_tags and assignees
	// 	// Selected values will be added on load
	// 	this.event_data = {
	// 		impact_tags: [],
	// 		assignees: []
	// 	};

	// 	return this;
	// },

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

	// createEvent: function(e){
	// 	e.preventDefault();
	// 	// console.log(this.event_data);
		
	// 	var settings_obj = this.event_data;
	// 	var new_event_model = new models.event.Model;

	// 	delete settings_obj.undefined;
	// 	delete settings_obj['assignees-selector'];

	// 	var required_keys = [
	// 		'timestamp',
	// 		'assignees',
	// 		'title',
	// 		'impact_tags'
	// 		];

	// 	this.validate(required_keys, function(error, description){
	// 		var that = this;
	// 		if (!error){
	// 			console.log('no error')
	// 			new_event_model.save(settings_obj, {
	// 				error: function(model, response, options){
	// 					console.log('error in event creation', response);
	// 					that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
	// 				},
	// 				success: function(model, response, options){
	// 					console.log('saved event', response);

	// 					views.helpers.toggleModal(e);
	// 					that.refresh({pikaday: true, search: true});
	// 				}
	// 			});
	// 		} else {
	// 			this.printMsgOnSubmit(error, description)
	// 		}

	// 	});


	// }

});