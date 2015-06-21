views.Tag = views.AA_BaseTag.extend({

	tagName: 'li',

	className: 'tag-wrapper',

	events: {
		'click': 'toggle'
	},

	initialize: function(){
		// console.log(this.model.toJSON())
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

	// filter: function(tagModel, isActive){
	// 	// console.log(tagModel.get('id'), tagModel.get('name'))
	// 	// var po_collection = tagModel.collection.metadata('po_collection'), // This can apply to multiple po collection instances
	// 	// 		filter = tagModel.collection.metadata('filter'),
	// 	// 		query_value = tagModel.get('id') || tagModel.get('name'); // For tags, this is the id, but for tag attributes it's the name

	// 	// // console.log(po_collection, filter, query_value)
	// 	// // If it's active set the query to the value of this tag
	// 	// if (isActive){
	// 	// 	// If that filter already has a condition, then chain its match set with `and`
	// 	// 	collections.po[po_collection].filters[filter].intersectQuery(query_value);
	// 	// } else {
	// 	// 	// If it's not active then clear the query from the PourOver match set.
	// 	// 	collections.po[po_collection].filters[filter].removeSingleQuery(query_value);
	// 	// }
	// 	return this;
	// },

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

	// getCount: function(){
	// 	var group = this.model.collection.metadata('filter'),
	// 			key, // For tags, this is the id, but for tag attributes it's the name
	// 			facet_key = group, // For categories and levels, the group name — that string — is the key on the facet object. For tags they're all under the `tags` key.
	// 			find_params = {};

	// 	// Navigating the fact object based on what type of value we want counts for
	// 	// For levels and attributes it's a little bespoke, for tags it's just `ids` all around, so set those as fall back
	// 	var crossover = {
	// 		subject_tags: {}, // Set this to default below
	// 		impact_tags: {},  // Set this to default below
	// 		categories: {
	// 			model_key: 'name',
	// 			key: 'category'
	// 		},
	// 		levels: {
	// 			model_key: 'name',
	// 			key: 'level'
	// 		}
	// 	};

	// 	var key = crossover[group].key || 'id',
	// 			model_key = crossover[group].model_key || 'id';

	// 	var facet = models.tag_facets.get(group);
	// 	find_params[key] = this.model.get(model_key);

	// 	var countInfo = _.findWhere(facet, find_params) || {count: 0};

	// 	return countInfo.count;

	// 	return this;

	// }



});