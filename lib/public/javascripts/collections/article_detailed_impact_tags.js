// TODO, the url
collections.article_detailed_impact_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.impact_tag.Model,
		set: function() {
			// Always remove contents before setting
			Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
		}
	})
}