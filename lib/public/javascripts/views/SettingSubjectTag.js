views.SettingSubjectTag = views.AA_BaseSetting.extend({

	tagName: 'li',

	initialize: function(){

		// Create the inner html from our subject tag template
		this.render();

		// Cache some initial values and set listeners
		this.initializeBase();

		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();
		this.initColorPicker('subject-tag');

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	render: function(){

		var subject_tag_markup = templates.subjectTagFactory({});

		this.$el.html(subject_tag_markup);

		return this;
	},

	setVal: function(){

		var inputs_data = this.assembleInputsData(['name', 'color']);

		inputs_data.forEach(function(inputData){
			var $input = inputData.$input;
			var val = inputData.val;

			var existing_value = $input.val() || '';

			if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
				$input.val(val);
			}

		}, this);


		return this;
	}

});