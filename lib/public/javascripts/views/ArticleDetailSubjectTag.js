views.ArticleDetailSubjectTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayout();
		this.listenTo(this.model, 'destroy', this.destroyView)
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), { toTitleCase: helpers.templates.articles.toTitleCase });
		var tag_markup = templates.articleDetailTagFactory(tag_data);
		this.$el.html(tag_markup);
		return this;
	},

	// styleLayout: function(){
	// 	var bg_color = this.model.get('color'),
	// 			text_color = this.whiteOrBlack(bg_color),
	// 			bg_color_darker = this.colorLuminance(bg_color, -.25);

	// 	// this.$el.css({'background-color': bg_color, 'color': text_color});
	// 	this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

	// 	return this;
	// },

	destroyView: function(model){
		this.killView();
	}

});