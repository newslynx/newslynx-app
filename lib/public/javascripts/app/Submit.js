app.Submit = Backbone.View.extend({
  el: '#main-wrapper',

  events: {
    'submit form': 'saveForm'
  },

  initialize: function(){

    this._subviews = [];

    this.$form = this.$el.find('#form-container');

    // // Cache these selectors
    // this.$drawer = $('#drawer');
    // this.$content = $('#content');

    // this.default_recipes = {
    //   'rss-feeds': {
    //     view_name: 'SettingRssFeed',
    //     recipe_name: app.defaults.rss_feed_recipe_name,
    //     options: {
    //       template: templates.rssFeedRecipeFactory
    //     }
    //   },
    //   'staff-twitter-lists': {
    //     view_name: 'SettingStaffTwitterList',
    //     recipe_name: app.defaults.staff_twitter_list_to_promotion_recipe_name,
    //     options: {
    //       template: templates.staffTwitterListRecipeFactory
    //     }
    //   },
    //   'twitter-users': {
    //     view_name: 'SettingTwitterUser',
    //     recipe_name: app.defaults.staff_twitter_user_to_promotion_recipe_name,
    //     options: {
    //       template: templates.twitterUserRecipeFactory
    //     }
    //   },
    //   'facebook-pages': {
    //     view_name: 'SettingFacebookPage',
    //     recipe_name: app.defaults.staff_facebook_page_to_promotion_recipe_name,
    //     options: {
    //       template: templates.facebookPageRecipeFactory
    //     }
    //   },
    //   'subject-tags': {
    //     view_name: 'SettingSubjectTag'
    //   },
    //   'impact-tags': {
    //     view_name: 'SettingImpactTag'
    //   }
    // };

    // Instantiate settings view
    this.render();

  },

  render: function(){

    console.log('here')

    this.$form.html('hey')


    return this;
  }

 

});