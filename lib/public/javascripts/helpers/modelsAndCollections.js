helpers.modelsAndCollections = {

	toggle: function(key){
		this.set(key, !this.get(key));
	},

	setBoolByIds: function(trueKey, idKey, ids, bool){
		ids = ids.split('+').map(function(id){ return +id });
		ids.forEach(function(id){
			var where_obj = {}; where_obj[idKey] = id;
			if (this.where(where_obj).length) this.where(where_obj)[0].set(trueKey, bool);
		}, this);
	},

	addTagsFromId: function(objectList){
		objectList.forEach(function(item){
			item.subject_tags = $.extend(true, [], item.subject_tags.map(function(d) {return pageData.org['subject_tags'].filter(function(f){ return f.id == d })[0] }) );
			item.events.forEach(function(ev){
				// console.log(pageData.org['impact_tags'])
				ev.impact_tags = $.extend(true, [], ev.impact_tags.map(function(d) {return pageData.org['impact_tags'].filter(function(f){ return f.id == d })[0] }) );
			})
		});
		return objectList;
	},

	metadata: function(prop, value) { 
		if (value === undefined) {
			return this[prop];
		} else {
			this[prop] = value;
		}
	},

	hydrateTagsInfo: function(dehydratedObjectList, info, tagKeys){
		// console.log(dehydratedObjectList, tagKeys);
		dehydratedObjectList.forEach(function(dehydratedObject){
			tagKeys.forEach(function(key){
				// Add the full info on a `[key_name + '_full']` property
				// This will take take ids in `obj['impact_tags']` or `obj['subject_tags']` and map them to full objects on `key + '_full'
				if (dehydratedObject[key]){
					dehydratedObject[key + '_full'] = dehydratedObject[key].map(function(id){ 
						return _.findWhere(info[key], {id: id});
					});
				}
			});

			// Add `impact_tag_categories` and `impact_tag_levels` as their own items for filtering based on our hydrated info above
			// But only if we've hydrated based on impact tag, which we don't always do because articles don't have impact tags, only subject tags
			if (dehydratedObject.impact_tags_full){
				var impact_tag_categories = _.chain(dehydratedObject.impact_tags_full).pluck('category').uniq().value();
				var impact_tag_levels     = _.chain(dehydratedObject.impact_tags_full).pluck('level').uniq().value();
				dehydratedObject['impact_tag_categories'] = impact_tag_categories;
				dehydratedObject['impact_tag_levels'] 		= impact_tag_levels;
			}
		});
		return dehydratedObjectList;
	},

	addTagInformation: function(articleDetail){
		var info = pageData.orgInfo;
		// Hydrate subject tags
		articleDetail = this.hydrateTagsInfo([articleDetail], info, ['subject_tags'])[0];
		// Hydrate each event
		articleDetail.events = this.hydrateTagsInfo(articleDetail.events, info, ['impact_tags']);
		// Add the impact category and level info on the parent for all of the events
		var impact_tags_full      = _.chain(articleDetail.events).pluck('impact_tags_full').flatten().uniq().value();
		// Hydrate these categories and levels with full data
		var impact_tag_categories = _.chain(articleDetail.events).pluck('impact_tag_categories').flatten().uniq().map(function(category){ return _.findWhere(info.impact_tag_categories, {name: category}) }).value();
		var impact_tag_levels     = _.chain(articleDetail.events).pluck('impact_tag_levels').flatten().uniq().map(function(level){ return _.findWhere(info.impact_tag_levels, {name: level}) }).value();
		articleDetail['impact_tags_full'] 		 = impact_tags_full;
		articleDetail['impact_tag_categories'] = impact_tag_categories;
		articleDetail['impact_tag_levels'] 		 = impact_tag_levels;

		return articleDetail;
	}
}