collections.article_detailed_tweets = {
  "Collection": Backbone.Collection.extend({

    metadata: helpers.modelsAndCollections.metadata,

    setUrl: function(articleId){
      this.url = 'api/_VERSION/events?sous_chefs=twitter-search-content-item-links-to-event&per_page=100&content_item_ids='+articleId
    },

    parse: function(response){
      this.metadata('pagination', response.pagination);
      this.metadata('total', response.total);
      return response.events;
    }

  })
}