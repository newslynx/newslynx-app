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

		this.listenTo(this.model, 'change:checked', this.syncToApi);
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

	syncToApi: function(model, checked){
		var self = this;
		var method = (checked) ? 'update' : 'delete';
		var col = collections.article_detailed_subject_tags.instance
		this.$el.addClass('disabled');

		col.sync(method, model, {
			success: function(modelBack, msg, response){
				var type = this.type;
				if (type === 'DELETE') {
					col.remove(model);
				} else if (type == 'PUT'){
					col.add(model);
				}
				self.$el.removeClass('disabled');
			},
			error: function(model, msg, response){
				app.instance.reportErr(model, response);
				self.$el.removeClass('disabled');
			}
		});

	}

});