// This collection holds our out-of-the-box recipe that handle article ingestion
collections.article_rss_feeds = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		// model: models.rss_feed.Model,
		metadata: helpers.modelsAndCollections.metadata,
		url: 'api/_VERSION/alerts'
	})
}