views.EventCreatorFromAlert = views.AA_BaseForm.extend({

	// events: _.extend({
	// }, views.AA_BaseForm.prototype.events),

	assignmentTemplateFactory: _.template('<div class="article-assignee""><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\'/></div>'),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);
		// Only some of the values on object are editable in the form
		var model = options.model;
		var alert_options = {
			created: model.created,
			url: model.url,
			content_items: model.content_items,
			title: model.title,
			description: model.description,
			tag_ids: model.tag_ids
		};

		// Add default values to the schema under the `selected` property
		var event_creator_schema_with_values = this.combineFormSchemaWithVals(event_creator_schema, alert_options);

		// // Store this on the schema with this article's information on the view
		// // We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.form_data = event_creator_schema_with_values;

		// Prep the area by creating the modal markup
		this.bakeModal('Create an event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender();
	},

	render: function(){
		var markup = '',
				form_data = $.extend(true, {}, this.form_data);

		// Bake the initial form data
		_.each(form_data, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	}

});