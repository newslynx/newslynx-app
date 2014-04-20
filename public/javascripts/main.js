(function(){

  var router;

	function bindHandlers(){
    // Rail section switching
		$('.rail-section').on('click', function(){
      var data_section = $(this).attr('data-section');
      router.navigate(data_section, {trigger: true});
    });
  }

  function switchSection(activeSection){
    $('.rail-section-title').removeClass('active');
    $('.content-section').removeClass('shown');
    $('.rail-section[data-section="'+activeSection+'"]').find('.rail-section-title').addClass('active');
    $('.content-section[data-section="'+activeSection+'"]').addClass('shown');
  }

	function handleRoute(){
		var Router = Backbone.Router.extend({
			routes: {
				":section": 'section' // Change the section visibility
			}
		});
		router = new Router;
		router.on('route:section', function(section) {
      switchSection(section);
		});
			
		// For bookmarkable Urls
		Backbone.history.start();
	}

	handleRoute();
	bindHandlers();

}).call(this);
