views.TagSectionNav = views.Tag.extend({

	initialize: function(){
		// Do everything our view.Tag does
		views.Tag.prototype.initialize.call(this);
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.setOpts);
		this.listenTo(models.tag_facets, 'change', this.updateLayoutByCount);

	},

	setOpts: function(tagModel, isActive){




		// console.log(tagModel.get('id'), tagModel.get('name'))
		// var po_collection = tagModel.collection.metadata('po_collection'), // This can apply to multiple po collection instances
		// 		filter = tagModel.collection.metadata('filter'),
		// 		query_value = tagModel.get('id') || tagModel.get('name'); // For tags, this is the id, but for tag attributes it's the name

		// // console.log(po_collection, filter, query_value)
		// // If it's active set the query to the value of this tag
		// if (isActive){
		// 	// If that filter already has a condition, then chain its match set with `and`
		// 	collections.po[po_collection].filters[filter].intersectQuery(query_value);
		// } else {
		// 	// If it's not active then clear the query from the PourOver match set.
		// 	collections.po[po_collection].filters[filter].removeSingleQuery(query_value);
		// }
		return this;
	},

	// Used to figure out, for tags, categories and levels, what it's key name is
	getCount: function(){
		var group = this.model.collection.metadata('filter'),
				model_json = this.model.toJSON(),
				obj = _.pick(model_json, 'id') || _.pick(model_json, 'name'); // For tags, this is the id, but for tag attributes it's the name

		var facet = models.tag_facets.get(group);
		var countInfo = _.findWhere(facet, obj) || {count: 0};

		return countInfo.count;

	}



});