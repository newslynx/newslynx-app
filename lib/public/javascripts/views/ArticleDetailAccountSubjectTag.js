views.ArticleDetailAccountSubjectTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	events: {
		'change': 'toggleChecked'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:checked', this.enableDisable)
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailAccountSubjectTagFactory(tag_data);
		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	styleLayout: function(){
		var bg_color   = this.model.get('color'),
				text_color = this.whiteOrBack(bg_color),
				bg_color_darker = this.colorLuminance(bg_color, -.1);

		this.$el.find('.tag-text').css({'background-color': bg_color, 'color': text_color});
		// this.$el.find('.tag-text').css({'background-color': bg_color, 'color': text_color, 'border': '1px solid ' + bg_color_darker});

		return this;
	},

	toggleChecked: function(){
		var checked = this.$el.find('input').prop('checked');
		this.model.set('checked', checked);
	},

	enableDisable: function(model, enabledState){
		console.log(this.model.url())
		var destroyable_model,
				article_detail_id,
				model_json;

		if (enabledState){
			this.model.save();
		} else {
			// Create a new model that we can delete so it doesn't mess up our view
			model_json = this.model.toJSON();
			article_detail_id = collections.article_detailed.instance.pluck('id')[0];
			destroyable_model = new models.subject_tag.Model(model_json);
			destroyable_model.urlRoot = '/api/articles/'+article_detail_id+'/subjects';
			destroyable_model.destroy({wait: true});
		}
	}

});