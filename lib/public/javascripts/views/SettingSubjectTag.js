views.SettingSubjectTag = views.AA_BaseSetting.extend({

	tagName: 'li',

	initialize: function(){


		// Create the inner html from our subject tag template
		this.render();

		// If we're creating this from an add button
		// add an empty model and a few other things
		this.checkIfNew();

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

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.subject_tag.Model({});
			this.$el.find('.js-parent-form').attr('data-new', 'true');
			console.log(this.$el.find('.js-parent-form'))
		}
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