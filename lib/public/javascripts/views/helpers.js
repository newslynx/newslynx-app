views.helpers = {
	toggleModal: function(e){
		e.preventDefault();
		e.stopPropagation();
		var $tray = $(e.currentTarget).parents('.modal-parent').find('.modal-outer');
		$tray.toggleClass('active', !$tray.hasClass('active'));
		// This will set `overflow: hidden` so you can't horizontal scroll
		$('body').attr('data-modal', $tray.hasClass('active'));

		// Center it
		this.centerishInViewport( $tray.find('.modal-inner') );
	},
	centerishInViewport: function($el){
		// Center the element horizontally and in the top third vertically
		var el_width = $el.outerWidth(),
		    el_height = $el.outerHeight(),
		    v_width = $(window).width(),
		    v_height = $(window).height();

		$el.css({
			top: (v_height/2 - (el_height))/v_height*100 + '%',
			left: (v_width/2 - (el_width/2))/v_width*100 + '%' // This line calculation can be improved
		});
	}
}