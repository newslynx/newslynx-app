views.ArticleSummaryDrawerImpactTag = Backbone.View.extend({

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
		// The only real distinction between this and the subject tag version
		// Set its border left and bg color to the appropriate color value in its data
		return this;
	},

	styleLayout: function(){
		var bg_color = this.getColor(),
				text_color = this.whiteOrBack(bg_color),
				bg_color_darker = this.getBorderColor();

		this.$el.css({'background-color': bg_color, 'color': text_color});
		// this.$el.css({'background-color': bg_color, 'color': text_color, 'border': '1px solid' + bg_color_darker});

		var tooltip_text = this.getLabel();
		this.$el.addClass('tooltipped').attr('aria-label', tooltip_text);

		return this;
	},

	getColor: function(){
		return this.model.get('color');
	},

	getBorderColor: function(){
		return this.colorLuminance(this.getColor(), -.1);
	},

	getLabel: function(){
		var category = this.model.get('category'),
				level = helpers.templates.prettyName(this.model.get('level')),
				tooltip_text = level + ' ' + category;

		return tooltip_text;
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
	},

	colorLuminance: function(hex, lum) {

		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	}

});