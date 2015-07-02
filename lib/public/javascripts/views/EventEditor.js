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
		this.full_info = {
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
				full_info = this.full_info;

		// Bake the initial form data
		_.each(full_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, full_info.vals[fieldName]);
		}, this);

		markup += this.bakeButtons(true); // `true` to bake delete button

		this.$form.html(markup);

		return this;
	},



	// render: function(){
	// 	var markup = '',
	// 			event_schema = $.extend(true, {}, this.event_schema);

	// 	// Bake the initial form data
	// 	_.each(event_schema, function(fieldData, fieldName){
	// 		markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
	// 	}, this);

	// 	markup += this.bakeButtons(true);

	// 	this.$form.html(markup);

	// 	var defaults = {
	// 		timestamp: event_schema.timestamp.selected,
	// 		link: event_schema.link.selected,
	// 		title: event_schema.title.selected,
	// 		description: event_schema.description.selected,
	// 		impact_tags: event_schema.impact_tags.selected
	// 	};

	// 	// In case there are no defaults for tags, which would be crazy
	// 	this.event_data = _.extend({
	// 		impact_tags: [],
	// 		assignees: []
	// 	}, defaults);

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

	// saveEvent: function(e){
	// 	e.preventDefault();
		
	// 	var settings_obj = this.event_data;


	// 	this.validate(required_keys, function(error, description){
	// 		var that = this;
	// 		if (!error){
	// 			that.model.save(settings_obj, {
	// 				// patch: true,
	// 				error: function(model, response, options){
	// 					console.log('error in event edit', response);
	// 					that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');

	// 				},
	// 				success: function(model, response, options){
	// 					console.log('event edited', response);
	// 					that.printMsgOnSubmit(false, '');
	// 					views.helpers.toggleModal(e);
	// 					that.model.trigger('rerender');
	// 					// TODO, update view
	// 				}
	// 			});
			
	// 		} else {
	// 			this.printMsgOnSubmit(error, description);
	// 		}

	// 	});

	// },



	
	// The tags shouldn't be objects, they should just be id numbers
	// dehydrateImpactTags: function(){
	// 	this.event_data.impact_tags = _.pluck(this.event_data.impact_tags, 'id');
	// }

});