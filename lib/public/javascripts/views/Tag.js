views.Tag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag-wrapper',

	events: {
		'click': 'toggle'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
		this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.filter);

	},

	render: function(){
		var tag_markup = templates.tagFactory( _.extend(this.model.toJSON(), helpers.templates) );

		this.$el.html(tag_markup);
		// Set its border left and bg color to the appropriate color value in its data
		this.styleLayout();
		return this;
	},

	filter: function(tagModel, isActive){
		var po_collection = tagModel.collection.metadata('po_collection'), // This can apply to multiple po collection instances
				filter = tagModel.collection.metadata('filter'),
				query_value = tagModel.get('id') || tagModel.get('name'); // For tags, this is the id, but for tag attributes it's the name

		// console.log(po_collection, filter, query_value)
		// If it's active set the query to the value of this tag
		if (isActive){
			// If that filter already has a condition, then chain its match set with `and`
			collections.po[po_collection].filters[filter].intersectQuery(query_value);
		} else {
			// If it's not active then clear the query from the PourOver match set.
			collections.po[po_collection].filters[filter].removeSingleQuery(query_value);
		}
		return this;
	},

	styleLayout: function(){
		var is_active = this.model.get('active'),
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
	}

});