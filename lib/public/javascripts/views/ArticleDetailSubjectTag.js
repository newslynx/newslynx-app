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

	destroyView: function(model){
		this.killView();
	}

});