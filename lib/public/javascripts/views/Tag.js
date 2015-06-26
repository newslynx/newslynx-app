views.Tag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag-wrapper',

	events: {
		'click': 'toggle'
	},

	initialize: function(){

		this.listenTo(this.model, 'change:active', this.styleLayout);
		// this.listenTo(this.model, 'change:active', this.filter);
		// this.listenTo(models.tag_facets, 'change', this.updateLayoutByCount);

	},

	render: function(){
		var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), helpers.templates) );

		this.$el.html(tag_markup);
		this.updateLayoutByCount();
		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	styleLayout: function(){
		var is_active = this.model.get('active') || false,
				bg_color = this.model.get('color'),
				set_bg_color = 'auto',
				set_text_color = 'auto';

		this.$el.find('.tag-container')
						.css('border-left-color', bg_color);

		// If this is active
		// Give it an active class
		// And set its background color to the one defined in its model
		// And the appropriate text color
		if (is_active) {
			set_bg_color = bg_color;
			set_text_color = this.whiteOrBlack(set_bg_color);
		}

		this.$el.toggleClass('active', is_active);
		this.$el.find('.tag-container')
						.css({'background-color': set_bg_color, 'color': set_text_color});

		return this;
	},

	toggle: function(){
		this.model.toggle('active');
		return this;
	},

	updateLayoutByCount: function(){
		console.log('here')
		var count = this.getCount(),
				show_el = count > 0;

		this.setCount(count);

		this.$el.toggle(show_el);

		return this;
	},

	setCount: function(count){

		this.$el.find('.tag-count').html(count);

		return this;

	}


});