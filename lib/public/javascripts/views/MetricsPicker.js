views.MetricsPicker = views.AA_BaseForm.extend({

  tagName: 'li',

  events: {
    'submit form': 'updateSelectDimensions'
  },

  template: function(){
    return _.template($('#metric-picker-item').html());
  },

  initialize: function( options ){

    this.collection = options.collection

    // Prep the area by creating the modal markup
    this.bakeModal('Select metrics');
    // this.bakeModal('Select metrics <span>(drag checked items to reorder)</span>');

    // Bake the dimension options + buttons
    this.render();

    // Enable dragging
    this.postRender({});

  },

  render: function( ){
    var current_selects = this.transformData(this.collection.getSelectDimensions())
    var current_select_names = _.pluck(current_selects, 'name')
    var not_select_dimensions = this.transformData(this.collection.toJSON(), current_select_names)

    var markup = '<ul>'

    var checkboxFactory = this.template()

    current_selects.forEach(function(selectDimension){
      _.extend(selectDimension, helpers.templates.articles)
      // Add the `checked` attribute
      var $tmp = $('<div></div>')
      $(checkboxFactory(selectDimension)).appendTo($tmp)
      $tmp.find('input').attr('checked', true)
      markup += $tmp.html()
    }, this)

    not_select_dimensions.forEach(function(nonSelectDimension){
      console.log(nonSelectDimension)
      _.extend(nonSelectDimension, helpers.templates.articles)
      markup += checkboxFactory(nonSelectDimension)
    }, this)

    markup += '</ul>'

    markup += this.bakeButtons();
    this.$form.html(markup);

    return this;

  },

  transformData: function(dimensions, selectsNames){
    var self = this;

    var dimensions_trns = dimensions.map(function(dimension){
      return {
        name: dimension.name,
        kind: self.discernKind(dimension.name)
      }
    })

    if (selectsNames) {
      dimensions_trns = dimensions_trns.filter(function(dimension){
        // Remove existing ones
        return !_.contains(selectsNames, dimension.name)
      })
    }

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

  },

  updateSelectDimensions: function(e){
    e.preventDefault();

    // Filter by non-falsey values, which are the unchecked checkboxes
    var select_dimensions = this.getSettings().dimensions.filter(_.identity)

    window.m = models.user_select_dimensions
    console.log(models.user_select_dimensions)

    models.user_select_dimensions.save({value: select_dimensions}, {
      success: function(model, response, options){
        // TODO, handle window closing print error msg
        // Have comparison grid listen for changes to this model, or manually trigger a refresh so that our initial fetch doesn't mess things up
      },
      error: function(model, response, options){
        // TODO, handle window closing print error msg
      }
    })


    return false
  }

});