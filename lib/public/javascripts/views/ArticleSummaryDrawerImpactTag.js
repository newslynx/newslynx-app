views.ArticleSummaryDrawerImpactTag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag',

	initialize: function(){
		// Set colors
		this.styleLayout();
		this.listenTo(this.model, 'change:destroy', this.destroyView);
		return this;
	},

	render: function(){
		var tag_data = _.extend(this.model.toJSON(), helpers.templates);
		var tag_markup = templates.articleDetailTagFactory(tag_data);

		this.$el.html(tag_markup);
		// The only real distinction between this and the subject tag version
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	},

	styleLayout: function(){
		var bg_color = this.getColor(),
				text_color = this.whiteOrBlack(bg_color),
				bg_color_darker = this.getBorderColor();

		// this.$el.css({'background-color': bg_color, 'color': text_color, 'border-color': bg_color_darker});
		this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

		var tooltip_text = this.getLabel();
		this.$el.addClass('tooltipped').attr('aria-label', tooltip_text);

		return this;
	},

	getColor: function(){
		return this.model.get('color');
	},

	getBorderColor: function(){
		return this.colorLuminance(this.getColor(), -.25);
	},

	getLabel: function(){
		var category = this.model.get('category'),
				level = helpers.templates.prettyName(this.model.get('level')),
				tooltip_text = level + ' ' + category;

		return tooltip_text;
	},

	destroyView: function(model, destroyMode){
		if (destroyMode){
			this.killView();
			this.model.set({destroy: false}, {silent: true});
		}
	}

});