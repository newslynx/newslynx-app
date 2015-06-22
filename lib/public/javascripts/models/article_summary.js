models.article_summary = {
	"Model": Backbone.Model.extend({
		defaults: {
			active_selected: false,
			// in_drawer: true,
			// destroy: false
		},
		toggle: helpers.modelsAndCollections.toggle,
		parse: function(articleSummaryJson){
			var hydrated_article_summary = this.hydrateTagsInfo(articleSummaryJson, pageData.tags, ['subject_tag_ids', 'impact_tag_ids']);
			return hydrated_article_summary;
		},
		hydrateTagsInfo: function(dehydratedObject, tags, tagKeys){
			tagKeys.forEach(function(key){
				// Add the full info on a key name with `full` in the title
				// This will take take ids in `obj['impact']` or `obj['subject']` and map them like to
				// `subject_tag_ids` => `subject_tags_full`
				if (dehydratedObject[key]){
					var full_key = key.replace('_ids', 's_full'); 
					dehydratedObject[full_key] = dehydratedObject[key].map(function(id){ 
						var tag_key = key.replace('_tag_ids',''); // They're stored on our tags object just as `subject` and and `impact`
						return _.findWhere(tags[tag_key], {id: id});
					}).sort(function(a,b){
						return a.name.localeCompare(b.name);
					});
				}
			});
			return dehydratedObject;
		}
	})
}