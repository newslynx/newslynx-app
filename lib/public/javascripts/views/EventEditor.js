views.EventEditor = views.AA_BaseForm.extend({

	events: _.extend({
		// 'submit form': 'saveModal'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// Add the passed in options
		// _.extend(this, _.pick(options, 'assignee'));
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		// Save a fresh copy under `schema`
		var event_creator_schema = _.clone(pageData.eventCreatorSchema);
		// Don't allow for a change in assignment
		delete event_creator_schema.content_items;

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.form_info = {
			schema: event_creator_schema,
			vals: options.model
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Edit this event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({search: false, pikaday: true});
	},

	render: function(){
		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons(true); // `true` to bake delete button

		this.$form.html(markup);

		return this;
	}


});