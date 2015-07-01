views.ArticleDetailSubjectTagEditor = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	events: {
		'change': 'toggleChecked'
	},

	initialize: function (options) {
		// Is this model checked?
		var article_subject_tag_ids = _.pluck(options.articleTags, 'id');
		this.model.set('checked', _.contains(article_subject_tag_ids, this.model.id));

		this.listenTo(this.model, 'change:checked', this.enableDisable);
		return this;
	},

	render: function () {
		var tag_data = _.extend({}, this.model.toJSON(), helpers.templates.articles);
		var tag_markup = templates.articleDetailAccountSubjectTagFactory(tag_data);
		this.$el.html(tag_markup);

		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	// styleLayout: function(){
	// 	var bg_color   = this.model.get('color'),
	// 			text_color = this.whiteOrBlack(bg_color),
	// 			bg_color_darker = this.colorLuminance(bg_color, -.1);

	// 	// this.$el.find('.tag-text').css({'background-color': bg_color, 'color': text_color});
	// 	this.$el.find('.tag-text').css({'background-color': bg_color, 'color': text_color, 'border': '1px solid ' + bg_color_darker});

	// 	return this;
	// },

	toggleChecked: function(){
		var checked = this.$el.find('input').prop('checked');
		this.model.set('checked', checked);
	},

	enableDisable: function(model, enabledState){
		var destroyable_model,
				article_detail_id,
				model_json = this.model.toJSON(),
				existing_models;

		if (enabledState){
			this.model.save();
			// You have to add all the models plus this model because I have it set up where this collection empties itself on set
			// I can't remember why it does that but before I mess with that, here's a quick fix
			existing_models = JSON.parse(JSON.stringify(collections.article_detailed_subject_tags.instance.models));
			existing_models.push(model_json)
			// Sort by name
			existing_models.sort(function(a,b){
				return a.name.localeCompare(b.name);
			});
			collections.article_detailed_subject_tags.instance.set(existing_models);
		} else {
			// Create a new model that we can delete so it doesn't mess up our view
			article_detail_id = collections.article_detailed.instance.pluck('id')[0];
			destroyable_model = new models.subject_tag.Model(model_json);
			destroyable_model.urlRoot = '/api/articles/'+article_detail_id+'/subjects';
			destroyable_model.destroy({wait: true});
			collections.article_detailed_subject_tags.instance.remove(model_json);
		}
	}

});