views.ArticleDetailSubjectTag = Backbone.View.extend({

	tagName: 'li',

	className: 'tag',

	events: {
		'click': 'remove'
	},

	template: _.template('<span class="tag-text"><%= name %></span>'),

	initialize: function(){
		// Set colors
		this.styleLayout();
		return this;
	},

	render: function(){
		var tag_data = this.model.toJSON();
		var tag_markup = this.template(tag_data);
		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	},

	styleLayout: function(){
		var bg_color = this.model.get('color'),
				text_color = this.whiteOrBack(bg_color);

		this.$el.css({'background-color': bg_color, 'color': text_color});

		return this;
	},

	remove: function(){
		// TODO, this should fire a call to the api
		console.log(this.model.url())
		this.model.destroy();
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