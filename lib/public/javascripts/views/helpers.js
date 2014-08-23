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
	},
	formSerialToObject: function(formInputsArray){
		// This is an array of objects for each `input` field
		// Each object contains `name` and `value` For instance:
		/* 
			name: "name"
			value: "Mentions of fracking coverage"
		*/
		// Transform an array of objects into an array of tuples
		var inputArrays = formInputsArray.map(function(inputObj) { return _.values(inputObj) });
		// Convert these into objects. We've cut out the `name` `value` parts of the object
		var inputObj = _(inputArrays).object();
		/*
			{
				name: "Mentions of fracking coverage"
			}
		*/
		return inputObj;
	},
	remodelRecipeJson: {
		create: function(formInfo, formInputsArray){
			var input_obj = views.helpers.formSerialToObject(formInputsArray);

			// Do some custom manipulations to get this object properly nested
			// Put the name on the top leve lobject
			formInfo.name = input_obj.name;
			// Delete it from the settings
			delete input_obj.name;
			// Add all the form information under settings
			formInfo.settings = input_obj;
			// And eventually add a defaults, the values of which will need to be extracted one by one
			formInfo.default_event = {};

			return formInfo;

		},
		update: function(formInfo, formInputsArray){
			var input_obj = views.helpers.formSerialToObject(formInputsArray);

			// Do some custom manipulations to get this object properly nested
			// Put the name on the top leve lobject
			formInfo.name = input_obj.name;
			// Delete a few things from the settings
			delete input_obj.name;
			delete input_obj.pending;
			// Add all the form information under settings
			formInfo.settings = input_obj;
			// And eventually add a defaults, the values of which will need to be extracted one by one
			formInfo.default_event = {};

			return formInfo;
		}
	}
}