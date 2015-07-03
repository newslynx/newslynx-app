app.Submit = Backbone.View.extend({
  el: '#main-wrapper',

  events: {
    'submit form': 'saveForm'
  },

  initialize: function(){

    this._subviews = [];

    this.$formContainer = this.$el.find('#form-container');

    // Instantiate settings view
    this.render();

  },

  render: function(){

    var defaults = {
      status: 'pending'
    };

    var event_creator_view = new views.EventCreator({el: this.$formContainer[0], model: defaults, collection: this.collection, disableModal: true, saveMsg: 'Pending event added to the Approval River!'});
    this._subviews.push(event_creator_view);
    this._time_picker = event_creator_view._time_picker;


    return this;
  }

 

});