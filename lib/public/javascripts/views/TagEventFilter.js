views.TagEventFilter = views.Tag.extend({

	initialize: function(options){
		// Do everything our view.Tag does
		views.Tag.prototype.initialize.call(this);
		// this.listenTo(this.model, 'change:active', this.styleLayout);
		this.listenTo(this.model, 'change:active', this.setOpts);
		this.listenTo(models.event_tag_facets, 'change', this.updateLayoutByCount);

		this.filterModel = options.filterModel;
		// this.tagFacets   = options.tagFacets;

	},

	setOpts: function(tagModel, isActive){
		var info = this.getImportantModelInfo(),
				group = info.group,
				value = _.values(info.id_key_value)[0],
				combined_group = group;

		var filter_model = this.filterModel;

		var tag_list = filter_model.get(group) || [];

		if (group == 'tags'){
			combined_group = 'tag_ids' // Do more massaging to handle hwo the API wants this parameter
		}

		if (isActive){
			tag_list.push(value);
		}else{
			tag_list = _.without(tag_list, value);
		}

		var has_tags = tag_list.length > 0;

		if (has_tags){
			filter_model.set(combined_group, tag_list);
		} else {
			filter_model.unset(combined_group);
		}

		filter_model.metadata(combined_group, has_tags);
		filter_model.trigger('filter');

		return this;
	},

	// Will return a single key/value pair of either the `id` and its id or the `name` and its name (for categories and levels)
	getImportantModelInfo: function(){
		var group = this.model.collection.metadata('filter'),
				model_json = this.model.toJSON(),
				info = _.pick(model_json, 'id'); // For tags, this is the id, but for tag attributes it's the name


		// Change our group name from `impact_tag_ids` to `tags`, which is how that's nested in our tag facet coming back from the api
		// We don't set it to this by default because our sorter requires that as the key. Instead of having two separate things, we do some massaging here
		if (/_tag_ids/.test(group)){
			group = 'tags';
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

		var facet = models.event_tag_facets.get(group);
		// var facet = this.tagFacets.get(group);
		var countInfo = _.findWhere(facet, find_obj) || {count: 0};

		return countInfo.count;

	}



});