views.ArticleSummaryDrawerSubjectTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayout();
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);
		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	},

	styleLayout: function(){
		var bg_color = this.model.get('color'),
				text_color = this.whiteOrBack(bg_color),
				bg_color_darker = this.colorLuminance(bg_color, -.1);

		this.$el.css({'background-color': bg_color, 'color': text_color});
		// this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

		return this;
	}
});