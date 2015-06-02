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
		this.setVals(['name', 'color']);
		this.initColorPicker('subject-tag');

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	checkIfNew: function(){
		if (!this.model){
			this.model = new models.subject_tag.Model({});
			collections.subject_tags.instance.add(this.model);
			this.$el.find('.js-parent-form').attr('data-new', 'true');
		}
		return this;
	},

	render: function(){

		var subject_tag_markup = templates.subjectTagFactory({});

		this.$el.html(subject_tag_markup);

		return this;
	}

});