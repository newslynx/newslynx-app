views.AddArticle = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'addArticle'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.addArticleSchema` so we don't mess anything up
		var add_article_schema = $.extend(true, {}, pageData.addArticleSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		this.event_schema = add_article_schema;

		// Prep the area by creating the modal markup
		this.bakeModal('Add an article');

		// Bake the modal container and form elements
		this.render();
		// Disable the title searcher but init pikaday
		this.postRender(true);
	},

	render: function(){
		var markup = '',
				event_schema = $.extend(true, {}, this.event_schema);

		// Bake the initial form data
		_.each(event_schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData);
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		// Preload with empty arrays for impact_tags and assignees
		// Selected values will be added on load
		this.event_data = {
			subject_tags: []
		};

		return this;
	},

	formListToObject: function(){
		var form_data = this.event_creator_options;
		var form_obj = {
			impact_tags: [],
			assignees: []
		};
		form_data.forEach(function(formItem){
			var name = formItem.name,
					form_value = formItem.selected;
			if (name != 'subject_tags'){
				form_obj[name] = form_value;
			} else {
				form_obj[name].push(form_value);
			}
		});
		return form_obj;
	},

	addArticle: function(e){
		e.preventDefault();
		// console.log(this.event_data);
		
		var settings_obj = this.event_data;
		var new_article_model = new models.new_article.Model;

		delete settings_obj.undefined;

		var required_keys = [
			'timestamp',
			'url',
			'title',
			'authors'
			];

		this.validate(required_keys, function(error, description){
			// Turn the authors field into an array of whitespace-trimmed strings
			if (settings_obj.authors){
				settings_obj.authors = settings_obj.authors.split(',').map(function(author){ return author.trim(); });
			}
			var that = this;
			if (!error){
				that.refresh(true);
				new_article_model.save(settings_obj, {
					error: function(model, response, options){
						console.log('Error in article creation', response);
						that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
					},
					success: function(model, response, options){
						console.log('Saved event', response);

						views.helpers.toggleModal(e);
						that.refresh(true);
					}
				});
			} else {
				this.printMsgOnSubmit(error, description)
			}

		});


	}

});