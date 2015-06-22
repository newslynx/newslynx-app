// This is most closely tied to metrics but it also includes information like `title` and `created` date which are just pieces of data
collections.dimensions = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		// model: models.rss_feed.Model,
		metadata: helpers.modelsAndCollections.metadata,
		selects: [
			{
				name: 'title',
				type: 'text'
			},{
				name: 'created',
				type: 'date'
			},{
				name: 'ga_pageviews',
				type: 'metric'
			},{
				name: 'twitter_likes',
				type: 'metric'
			},{
				name: 'twitter_shares',
				type: 'metric'
			},{
				name: 'facebook_likes',
				type: 'metric'
			},{
				name: 'facebook_shares',
				type: 'metric'
			},{
				name: 'reddit_upvotes',
				type: 'metric'
			}
		]
	})
}