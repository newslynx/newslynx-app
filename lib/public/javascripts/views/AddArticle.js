views.AddArticle = views.AA_BaseForm.extend({

	events: _.extend({
		'submit form': 'addArticle'
	}, views.AA_BaseForm.prototype.events),

	initialize: function(options){
		// First perform a deep copy of our existing `pageData.addArticleSchema` so we don't mess anything up
		var add_article_schema = _.clone(pageData.addArticleSchema);

		// Store this on the schema with this article's information on the view
		// We will re-render the view on form submit, rendering makes a copy of these initial settings
		// this.event_schema = add_article_schema;
		this.form_info = {
			schema: add_article_schema,
			vals: {}
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Add an article');

		// Bake the modal container and form elements
		this.render();
		// Disable the title searcher but init pikaday
		this.postRender({pikaday: true});
	},

	render: function(){
		var markup = '',
				form_info = this.form_info;

		// Bake the initial form data
		_.each(form_info.schema, function(fieldData, fieldName){
			markup += this.bakeFormInputRow.call(this, fieldName, fieldData, false, form_info.vals[fieldName] );
		}, this);

		markup += this.bakeButtons();

		this.$form.html(markup);

		return this;
	},

	// addArticle: function(e){
	// 	e.preventDefault();
	// 	// console.log(this.event_data);
		
	// 	var settings_obj = this.event_data;
	// 	var new_article_model = new models.new_article.Model;

	// 	delete settings_obj.undefined;

	// 	var required_keys = [
	// 		'created',
	// 		'url',
	// 		'title',
	// 		'authors'
	// 	];

	// 	this.validateNew(, function(error, description){
	// 		// Turn the authors field into an array of whitespace-trimmed strings
	// 		if (settings_obj.authors){
	// 			settings_obj.authors = settings_obj.authors.split(',').map(function(author){ return author.trim(); });
	// 		}
	// 		var that = this;
	// 		if (!error){
	// 			that.refresh({pikaday: true});
	// 			new_article_model.save(settings_obj, {
	// 				error: function(model, response, options){
	// 					console.log('Error in article creation', response);
	// 					that.printMsgOnSubmit(true, 'Could not save to the server. Send me an email with a description of what you were doing and I\'ll look into it: <a href="mailto:meow@newslynx.org">meow@newslynx.org</a> &mdash; <em>Merlynne</em>.');
	// 				},
	// 				success: function(model, response, options){
	// 					console.log('Saved event', response);

	// 					views.helpers.toggleModal(e);
	// 					that.refresh({pikaday: true});
	// 				}
	// 			});
	// 		} else {
	// 			this.printMsgOnSubmit(error, description)
	// 		}

	// 	});


	// }

});