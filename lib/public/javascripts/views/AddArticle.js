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
			vals: {
				extract: true
			}
		};

		// Prep the area by creating the modal markup
		this.bakeModal('Add an article');

		// The model that will be instantiated when we create a new one
		this.newModel = options.newModel

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

	refresh: function(){
		this.silenceAllSubviews();

		// Bake the modal container and form elements
		this.render();
		// Init the title searcher and pikaday
		this.postRender({pikaday: true});

		// Clear submit message
		this.flashSubmitMsg(false, 'Article processing!');

		return this;

	},

	addArticle: function(e){
		e.preventDefault();

		var self = this;

		var form_data = this.getSettings();

		var new_article_model = new this.newModel; 
		new_article_model.unset('active_selected');
		new_article_model.unset('selected_for_compare');
		new_article_model.unset('selected_for_detail');

    this.setProcessing(e, true)
		this.printMsgOnSubmit(false, '');

		this.validate(this.form_info.schema, form_data, function(err, msg){
			if (!err){
				self.toggleBtnsDisabled();

				// Use `collection.sync('create' ...` instead of `collection.create` because the latter also adds the model
				// Which will fire an update and add it to the dom but that isn't really what we want here because our dom is a
				// a result of filtering and such
				new_article_model.save(form_data, {
					wait: true,
					error: function(model, response, options){
						console.log('Server error on event edit', response);

						self.toggleBtnsDisabled();
						self.printMsgOnSubmit(true, 'Error ' + response.status + ': ' + response.responseText.replace(/\n/g, '<br/><br/>'));
				    self.setProcessing(e, false)
					},
					success: function(model, response, options){
						// Re-render view with updates to this model
						console.log(response)

						// Close the modal
						// self.toggleModal(e);
						self.refresh();
				    self.setProcessing(e, false)
						self.toggleBtnsDisabled();

					}
				});

			} else {
				self.printMsgOnSubmit(err, msg);
		    self.setProcessing(e, false)
			}

		}, this);

		return this;

	}

});