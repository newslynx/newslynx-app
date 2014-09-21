views.EventCreator = views.AA_BaseForm.extend({

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

		// TEMPORARY, convert the `what_happened` and `significance` to `paragraph` types
		// Remove this when you refactor the alert form
		event_creator_schema.what_happened.type = 'paragraph';
		event_creator_schema.significance.type = 'paragraph';
		// And timestamp to timestamp
		event_creator_schema.timestamp.type = 'timestamp';
		// And assignee to article-search
		event_creator_schema.assignees.type = 'article-search';

		// Set the selected property on the schema for the assignee
		event_creator_schema.assignees.selected = [];
		event_creator_schema.assignees.selected.push(options.assignee);
		// event_creator_schema.assignees.selected = this.assignee.id;
		// event_creator_schema.assignees.label = this.assignee.title;

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.schema = event_creator_schema;

		// Prep the area by createing the modal markup
		this.bakeModal('Create an event');

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender();
	},

	render: function(){
		var markup = '',
				event_data = $.extend(true, {}, this.schema);

		// Bake the initial form data
		_.each(event_data, function(fieldData, fieldName){
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

		return this
	},

	// render: function(){
	// 	var d3_el = this.d3_el,
	// 			form_data = this.event_creator_options,
	// 			that = this;
		
	// 	/*
	// 		Modal has the following structure
	// 		.modal-outer
	// 			.modal-overlay.modal-close
	// 			.modal-inner
	// 				.modal-title TITLE GOES HERE
	// 				form
	// 	*/

	// 	var modal_outer = d3_el.append('div')
	// 		.classed('modal-outer', true);

	// 	modal_outer.append('div')
	// 		.classed('modal-overlay', true)
	// 		.classed('modal-close', true);

	// 	var modal_inner = modal_outer.append('div')
	// 		.classed('modal-inner', true)

	// 	modal_inner.append('div')
	// 			.classed('modal-title', true)
	// 			.html('Create event');

	// 	// Enter selection on the form
	// 	var form = modal_inner.append('form');
	// 	var _form = form.selectAll('.form-row').data(form_data).enter();


	// 	// This data looks like
	// 	/*
	// 	[
	// 	  {
	// 	    "type": "text",
	// 	    "name": "timestamp"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "name": "text"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "name": "link"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "help": {
	// 	      "hint": "Search by headline..."
	// 	    },
	// 	    "name": "assignees"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "name": "title"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "name": "what_happened"
	// 	  },
	// 	  {
	// 	    "type": "text",
	// 	    "name": "significance"
	// 	  },
	// 	  {
	// 	    "type": "checkbox",
	// 	    "options": [],
	// 	    "name": "impact_tags"
	// 	  }
	// 	]
	// 	*/
	// 	var form_row = _form.append('div')
	// 		.classed('form-row', true);

	// 	form_row.append('div')
	// 		.classed('form-row-label-container', true)
	// 		.append('label')
	// 			.attr('for', function(d){ return d.name })
	// 			.html(function(d){ return helpers.templates.prettyName(d.name) })



	// 	form_row.append('div')
	// 		.attr('aria-label', function(d){
	// 			var label = d.label;	
	// 			if (label) {
	// 				return label;
	// 			}
	// 		})
	// 		.attr('class', function(d){
	// 			var label = d.label;
	// 			if (label) {
	// 				return 'labelled';
	// 			}
	// 		})
	// 		.classed('form-row-input-container', true)
	// 			.append('input')
	// 				.attr('type', function(d){ return d.type })
	// 				.attr('name', function(d) { return d.name })
	// 				.property('value', function(d) { 
	// 					var selected = d.selected;
	// 					if (selected){
	// 						return selected;
	// 					} else {
	// 						return '';
	// 					}
	// 				})
	// 				.attr('placeholder', function(d){
	// 					var help_text = d.help;
	// 					if (help_text && help_text.hint){
	// 						return help_text.hint;
	// 					}
	// 				})
	// 				.each(function(d){
	// 					// Initialize date picker for timestamp
	// 					var name = d.name,
	// 							picker,
	// 							el = this;
	// 					if (name == 'timestamp'){
	// 						var time_picker = new Pikaday({
	// 							field: el,
	// 							clearInvalidInput: true,
	// 							onSelect: function(){
	// 								var this_date = this.getDate(),
	// 										timestamp = this_date.getTime();
	// 								// On change, save the timestamp to the data
	// 								var timestamp_list_object = _.findWhere(form_data, {name: 'timestamp'});
	// 								timestamp_list_object.selected = timestamp/1000;
	// 							},
	// 							onClear: function(){
	// 								// Clear the timestamp on error or non-date value
	// 								var timestamp_list_object = _.findWhere(form_data, {name: 'timestamp'});
	// 								timestamp_list_object.selected = null;
	// 							}
	// 						});
	// 					}
	// 				})
	// 				.bind(form_data, 'selected', function(d, i, value) {
	// 					if (value) {
	// 						return value;
	// 					} else {
	// 						return '';
	// 					}
	// 				});

	// 	/* HTML 
	// 	.buttons-container
	// 		button.cancel Cancel
	// 		input.save(type="submit", value="Create")
	// 		*/

	// 	var btn_container = form.append('div')
	// 		.classed('buttons-container', true);

	// 	// Cancel
	// 	btn_container.append('button')
	// 		.classed('cancel', true)
	// 		.classed('modal-toggle', true)
	// 		.html('Cancel');

	// 	// Save
	// 	btn_container.append('input')
	// 		.classed('save', true)
	// 		.attr('type', 'submit')
	// 		.property('value', 'Create');

	// 	form.on('submit', function(){
	// 		d3.event.preventDefault();
	// 		d3.event.stopPropagation();
	// 		that.createEvent();
	// 	})


	// 	// this.update();

	// 	return this;

	// },

	update: function(){
		// var update_selection = this.d3_el.data(this.event_creator_schema).update();

		// update_selection.select()
		// text: function(fieldName, fieldNamePretty, data){
		// 	var value = this.escapeQuotes(data.selected) || '',
		// 			markup,
		// 			label = ''
		// 	markup = '<div class="form-row">';
		// 		markup += '<div class="form-row-label-container">';
		// 			markup += '<label for="'+fieldName+'"> '+fieldNamePretty+'</label> ';
		// 		markup += '</div>';
		// 		markup += '<div class="form-row-input-container">';
		// 			if (data.help && data.help.link) markup += '<div class="help-row"><a href="'+data.help.link+'" target="_blank">How do I search?</a></div>'; 
		// 			if (fieldName == 'assignees') { fieldName = 'assignees-selector'; }
		// 			else if (fieldName == 'timestamp') label = '<div class="labelled" aria-label="'+this.prettyTimestamp(value)+'"></div>';
		// 			markup += label+'<input type="text" name="'+fieldName+'" class="'+fieldName+'" value="'+value+'" placeholder="'+((data.help && data.help.hint) ? this.escapeQuotes(data.help.hint) : '') +'"/>';
		// 		markup += '</div>';
		// 	markup += '</div>';
		// 	return markup;
		// },


	},

	// createEvent: function(){
	// 	console.log('saving');
	// 	// TODO, either the api has to change or we post this back as an object
	// 	var settings_obj = this.formListToObject();
	// 	var new_event_model = new models.event.Model; 

	// 	new_event_model.save(settings_obj, {
	// 		error: function(model, response, options){
	// 			console.log('error in event creation', response);

	// 		},
	// 		success: function(model, response, options){
	// 			console.log('saved event', response);

	// 			// views.helpers.toggleModal(e);
	// 		}
	// 	});
	// },

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