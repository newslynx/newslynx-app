views.ArticleDetailImpactTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayoutWithTooltip();
		// TODO, look into when this is ever getting destroyed
		this.listenTo(this.model, 'change:destroy', this.destroyView)
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);

		this.$el.html(tag_markup);
		return this;
	},

	// getLabel: function(){
	// 	var category = this.model.get('category'),
	// 			level = helpers.templates.prettyName(this.model.get('level')),
	// 			tooltip_text = level + ' ' + category;

	// 	return tooltip_text;
	// },

	// destroyView: function(model, destroyMode){
	// 	if (destroyMode){
	// 		this.killView();
	// 		this.model.set({destroy: false}, {silent: true});
	// 	}
	// }

});