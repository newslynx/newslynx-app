var helpers = helpers || {};
helpers.modelsAndCollections = {
	toggle: function(key){
		this.set(key, !this.get(key));
	},
	getTrue: function(key){
		var where_obj = {}; where_obj[key] = true;
		return this.where(where_obj);
	},
	zeroOut: function(key){
		this.getTrue(key).forEach(function(model){
			model.set(key, false);
		});
	},
	setBoolByIds: function(trueKey, idKey, ids, bool){
		ids = ids.split('&');
		ids.forEach(function(id){
			var where_obj = {}; where_obj[idKey] = id;
			this.where(where_obj)[0].set(trueKey, bool);
		}, this);
	},
	addTagsFromId: function(objectList){
		objectList.forEach(function(item){
			item.subject_tags = $.extend(true, [], item.subject_tags.map(function(d) {return pageData.org['subject_tags'].filter(function(f){ return f.uid == d })[0] }) );
			item.events.forEach(function(ev){
				// console.log(pageData.org['impact_tags'])
				ev.impact_tags = $.extend(true, [], ev.impact_tags.map(function(d) {return pageData.org['impact_tags'].filter(function(f){ return f.uid == d })[0] }) );
			})
		});
		return objectList;
	}
}