views = views || {};

views.Tag: Backbone.View.extend({

	tagName: 'li',

	className: 'tag-wrapper',

	events: {
		click: 'toggle'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
		this.listenTo(this.model, 'change', this.styleLayout);

	},

	render: function(){
		var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), templates.helpers) );

		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	styleLayout: function(){
		this.$el.find('.tag-container')
						.css('border-left-color', this.model.get('color'))

		// If this is active
		// Give it an active class
		// And set its background color to the one defined in its model
		var is_active = this.model.get('active'),
		    color = (is_active) ? this.model.get('color') : 'auto';

		this.$el.toggleClass('active', is_active)
						.find('.tag-container')
						.css('background-color', color);

		return this;
	},

	toggle: function(){
		this.model.toggle('active');
		return this;
	}
})