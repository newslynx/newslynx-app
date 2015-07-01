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
		if (!this.metadataHash){
			this.metadataHash = {};
		}
		if (value === undefined) {
			return this.metadataHash[prop];
		} else {
			this.metadataHash[prop] = value;
		}

	}

}