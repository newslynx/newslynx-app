views.MetricsPicker = views.AA_BaseForm.extend({

  tagName: 'li',

  initialize: function( options ){

    this.options = options

    // Prep the area by creating the modal markup
    this.bakeModal('Pick metrics');

    // Bake the dimension options + buttons
    this.render();

    // Enable dragging
    this.postRender({});

  },

  render: function( ){
    var dimensions = this.transformData()

    console.log(_.pluck(dimensions, 'name'))

    var markup = ''

    markup += this.bakeButtons();
    this.$form.html(markup);

    return this;

  },

  transformData: function(){
    var self = this;
    var dimensions = this.options.collection.toJSON()

    var dimensions_trns = dimensions.map(function(dimension){
      return {
        name: dimension.name,
        kind: self.discernKind(dimension.name)
      }
    })

    return dimensions_trns
  },

  discernKind: function(dimensionName) {
    var found_kind
    // There are four "kinds": `text`, `date`, `metric` and `bars`
    // We don't allow for much customization on what users can create and this list is rather fixed, so process of elimination is okay for now
    var kinds = {
      text: ['title'],
      date: ['created', 'updated'],
      bars: ['subject_tags', 'impact_tags']
    }

    _.some(Object.keys(kinds), function(kind){
      var list = kinds[kind]
      if (_.contains(list, dimensionName)) {
        found_kind = kind
        return true
      } else {
        return false
      }
    })

    // If it wasn't one of those, then give it a `metric` kind
    if (!found_kind) {
      found_kind = 'metric'
    }

    return found_kind

  }

});