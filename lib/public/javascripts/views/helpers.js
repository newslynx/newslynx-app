views.helpers = {

	toggleModal: function(e){
		e.preventDefault();
		e.stopPropagation();
		var $modalParent = $(e.currentTarget).parents('.modal-parent');
		var $tray = $modalParent.find('.modal-outer');
		$tray.toggleClass('active', !$tray.hasClass('active'));
		// This will set `overflow: hidden` so you can't horizontal scroll
		$('body').attr('data-modal', $tray.hasClass('active'));
		// Give the parent a flag to control styles and things
		$modalParent.attr('data-modal-open', $tray.hasClass('active'));

		// Center it
		this.centerishInViewport( $tray.find('.modal-inner') );
	},

	centerishInViewport: function($el){
		// Center the element horizontally and ten percent above the center of vertical
		var el_width = $el.outerWidth(),
		    el_height = $el.outerHeight(),
		    v_width = $(window).width(),
		    v_height = $(window).height();


		$el.css({
			top:  _.max([4, (((v_height/2 - (el_height/2))/v_height*100) - 10)]) + '%',
			left: (v_width/2 - (el_width/2))/v_width*100 + '%' 
		});
	},

	// groupSetEventOptions: function(json){
	// 	json.set_event_options = {};
	// 	_.each(json.options, function(val, key){
	// 		if (/^set_event_/.test(key)){
	// 			json.set_event_options[key] = val;
	// 			delete json.options[key];
	// 		}
	// 	});
	// 	return json;
	// }
}