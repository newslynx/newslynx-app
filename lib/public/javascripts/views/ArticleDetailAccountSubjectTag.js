views.ArticleDetailAccountSubjectTag = Backbone.View.extend({

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
				text_color = this.whiteOrBack(bg_color);

		this.$el.find('.tag-text').css({'background-color': bg_color, 'color': text_color});

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
	},

	whiteOrBack: function(bgColorHex){
		// Kill the hex value
		rgbColor = this.hexToRgb(bgColorHex);
		var r = rgbColor.r,
				g = rgbColor.g,
				b = rgbColor.b;
		var yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return (yiq >= 128) ? 'black' : 'white';
	},

	hexToRgb: function(hex){
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		    return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
});