// Adapated for NewsLynx from https://gist.github.com/DelvarWorld/3784055
// Usage: $form.find('input[type="checkbox"]').shiftSelectable();
// replace input[type="checkbox"] with the selector to match your list of checkboxes
 
$.fn.shiftSelectable = function() {
	var lastChecked,
			$boxes = this;
	 
	$boxes.click(function(evt) {
		if (!lastChecked) {
			lastChecked = this;
			return;
		}
		 
		if (evt.shiftKey) {
			var start = $boxes.index(this),
					end = $boxes.index(lastChecked),
					up = start - end < 0; // If this is true we are seleting up the list
			
			// If we're clicking up the slist, don't select the first one, since that will be handled by our click handler in the app
			if (up) {
				start = start + 1;
			}

			var slice_start = Math.min(start, end),
					slice_end = Math.max(start, end),
					boxes_selection = $boxes.slice(slice_start, slice_end);

			boxes_selection.each(function(i){
				var $box = $(this);

				if (!$box.hasClass('active')) {
					$box.trigger('click');
				}
			})
		}
		 
		lastChecked = this;
	});
};