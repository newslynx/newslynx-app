views.AA_BaseRecipe = views.AA_BaseForm.extend({

	events: _.extend({
		'change .schedule_by': 'getScheduleByVal'
	}, views.AA_BaseForm.prototype.events),

	assignmentTemplateFactory: _.template('<div class="article-assignee"><span class="remove-assignee labelled" aria-label="<%= title %>" >&times;</span><input type="hidden" name="set_event_content_items[]:object" value=\'{"id": <%= id %>, "title": "<%= title %>"}\' data-is-default-event="true"/></div>'),

	removeSetEventPrefix: function(fieldName){
		return fieldName.replace(/^set_event_/, '');
	},

	getScheduleByVal: function(e){
		var $select = $(e.currentTarget),
				val = $select.val();

		this.updateScheduleByLayout(val);

		return this;
	},

	updateScheduleByLayout: function(val){
		// If this is called with no value, trigger a change event, which will grab the value and update the layout
		// Useful for setting layout on load
		if (val){
			this.$form.find('.form-row[data-group="schedule_by"][data-which!="'+val+'"]').hide();
			this.$form.find('.form-row[data-group="schedule_by"][data-which="'+val+'"]').show();
		} else {
			this.$form.find('.schedule_by').trigger('change');
		}

		return this;
	},

	separateSchemaFromEvent: function(optionsJson){
		var settingsInfo = _.pick(optionsJson, function(val, key){
			return !/^set_event_/.test(key);
		});
		var eventInfo = _.pick(optionsJson, function(val, key){
			return /^set_event_/.test(key);
		});
		return {settingsInfo: settingsInfo, eventInfo: eventInfo};

	}

});