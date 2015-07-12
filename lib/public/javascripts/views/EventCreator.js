views.EventCreator = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'saveModal' // All other forms are filled out by their parent view, but the parent view is the `articleDetail` and that is already cluttered
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Save a fresh copy under `schema`, only perform a shallow clone since we won't be modifying its children
		var event_creator_schema = _.clone(pageData.eventCreatorSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.form_info = {
			schema: event_creator_schema,
			vals: options.model
		};

		// Prep the area by creating the modal markup
		if (!options.disableModal){
			this.bakeModal('Create an event');
		} else {
			this.$form = this.$el.find('form')
		}

		this.saveMsg = options.saveMsg || '';

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});

	},

	refresh: function(){
		this.silenceAllSubviews();

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: true, pikaday: true});

		// Clear submit message
		this.flashSubmitMsg(false, this.saveMsg);

		return this;

	},

	render: function(){

		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	},

	saveModal: function(e){
		e.preventDefault();

		var self = this;

		var form_data = this.getSettings();

		this.validate(this.form_info.schema, form_data, function(err, msg){
			if (!err){
				self.toggleBtnsDisabled();
				self.printMsgOnSubmit(false, '');
				// Unlike other models, we use a `create` here instead of a save.
				this.collection.create(form_data, {
					wait: true,
					error: function(model, response, options){
						console.log('Server error on event edit', response);

						self.toggleBtnsDisabled();
						self.printMsgOnSubmit(true, 'Error '+response.status+': ' + response.responseText.replace(/\n/g, '<br/><br/>'));
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						console.log(response)

						// Close the modal
						// self.toggleModal(e);
						self.refresh();

					}
				});

			} else {
				self.printMsgOnSubmit(err, msg);
			}

		}, this);

		return this;

	}


});