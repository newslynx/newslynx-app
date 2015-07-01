collections.article_detailed_subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		// setUrl: function(id){
		// 	this.url = '/api/content/'+id+'/tag/';
		// 	return this;
		// }
		// set: function() {
		// 	// Always remove contents before setting
		// 	Backbone.Collection.prototype.remove.call(this, this.models );
		// 	Backbone.Collection.prototype.set.apply(this, arguments);
		// }
	})
}