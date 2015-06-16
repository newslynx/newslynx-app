views.EventCreatorFromAlert = views.AA_BaseForm.extend({

	events: _.extend({
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.eventCreatorSchema` so we don't mess anything up
		var event_creator_schema = $.extend(true, {}, pageData.eventCreatorSchema);

		var recipe_default_event = {
			content_item_ids: this.model.content_items
		};

		recipe_default_event.link = this.model.url;
		recipe_default_event.datetime = this.model.created;

		// Hydrate default_event selected assignees with full article information
		// if (recipe_default_event.assignees){
		// 	recipe_default_event.assignees = recipe_default_event.assignees.map(function(id){
		// 		if (_.isNumber(id)){
		// 			return _.findWhere(pageData.articleSkeletons, {id: id});
		// 		} else {
		// 			return id;
		// 		}
		// 	});
		// }

		// TODO, This needs title and description stuff

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
			// console.log(fieldData, fieldName);
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			_id: this.model.id,
			tag_ids: [],
			content_item_ids: []
		};

		return this;
	},

	formListToObject: function(){
		var form_data = this.event_creator_options;
		var form_obj = {
			tag_ids: [],
			content_item_ids: []
		};
		form_data.forEach(function(formItem){
			var name = formItem.name,
					form_value = formItem.selected;
			if (name != 'tag_ids' && name != 'content_item_ids'){
				form_obj[name] = form_value;
			} else {
				form_obj[name].push(form_value);
			}
		});
		return form_obj;
	},

	getSettings: function(){

		var settings_obj = this.event_data;

		delete settings_obj.undefined;
		delete settings_obj['assignees-selector'];

		// console.log(settings_obj)

		return settings_obj;


		return this;
	}



});