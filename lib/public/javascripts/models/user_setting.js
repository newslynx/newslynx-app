models.user_setting = {
  "Model": Backbone.Model.extend({
    metadata: helpers.modelsAndCollections.metadata,
    url: function(){
      return 'api/_VERSION/me/settings' + this.get('name')
    }
  })
}