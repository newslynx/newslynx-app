views.TagEventFilter = views.Tag.extend({

	initialize: function(){
		// Do everything our view.Tag does
		views.Tag.prototype.initialize.call(this);
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.setOpts);
		this.listenTo(models.tag_facets, 'change', this.updateLayoutByCount);

	},

	setOpts: function(tagModel, isActive){
		// var info = this.getImportantModelInfo(),
		// 		group = info.group,
		// 		value = _.values(info.id_key_value)[0];

		// var tag_list = models.content_item_filters.get(group) || [];

		// if (isActive){
		// 	tag_list.push(value);
		// }else{
		// 	tag_list = _.without(tag_list, value);
		// }

		// if (tag_list.length){
		// 	models.content_item_filters.set(group, tag_list);
		// } else {
		// 	models.content_item_filters.unset(group);
		// }

		// models.content_item_filters.trigger('filter');

		return this;
	},

	// Will return a single key/value pair of either the `id` and its id or the `name` and its name (for categories and levels)
	getImportantModelInfo: function(){
		var group = this.model.collection.metadata('filter'),
				model_json = this.model.toJSON(),
				info = _.pick(model_json, 'id'); // For tags, this is the id, but for tag attributes it's the name


		// Change our group name from `subject_tag_ids` to `subject_tags` and same for impact tags
		// We don't set it to this by default because our sorter requires that as the key. Instead of having two separate things, we do some massaging here
		if (/_tag_ids/.test(group)){
			group = group.replace('_tag_ids', '_tags');
		}

		// So do some testing if that came out to empty and take the name instead if so
		if (_.isEmpty(info)){
			info = _.pick(model_json, 'name'); 
		}

		return {id_key_value: info, group: group};
	},

	// Used to figure out, for tags, categories and levels
	getCount: function(){
		var info = this.getImportantModelInfo(),
				group = info.group,
				find_obj = {};

		var replacements = {
			categories: 'category',
			levels: 'level'
		};

		// Do one last bit of massaging to remove the `s` from the group, which will give our key name
		// It's current `{name: 'internal'}` but that should be `{level: 'internal'}`
		if (replacements[group]){
			find_obj[replacements[group]] = _.values(info.id_key_value)[0];
		} else {
			find_obj = info.id_key_value;
		}

		var facet = models.tag_facets.get(group);
		var countInfo = _.findWhere(facet, find_obj) || {count: 0};

		return countInfo.count;

	}



});