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
		// Center the element horizontally and ten percent above the center of vertical
		var el_width = $el.outerWidth(),
		    el_height = $el.outerHeight(),
		    v_width = $(window).width(),
		    v_height = $(window).height();

		$el.css({
			top:  (((v_height/2 - (el_height/2))/v_height*100) - 10) + '%',
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
		var inputArrays = formInputsArray.map(function(inputObj) { 
			var name_parts;
			// These need some additional mapping in case they are checkbox items
			// This is used to detect some unusual situations where we need to nest objects. TODO, assignee
			if ( inputObj.name.indexOf('impact_tags|') != -1 || inputObj.name.indexOf('asignee|') != -1 ){
				name_parts = inputObj.name.split('|');
				inputObj.name = name_parts[0];
				inputObj.value = name_parts[1];
			}
			return inputObj
		});

		// Convert these into objects. We've cut out the `name` `value` parts of the object and nested things with multiple keys as an array
		// This is probably possible through underscore chaining of `groupBy`, `map`, then some type of use of `object` but this works too.
		var inputObj = d3.nest()
		    .key(function(d) { return d.name })
		    .rollup(function(list){
		    		// TODO, possibly the same type of gate for assignee
		        if (list.length == 1 && list[0].name != 'impact_tags') return list[0].value;
		        else return list.map(function(f) { return f.value });
		    })
		    .map(inputArrays);

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
			// console.log(input_obj)
			// Do some custom manipulations to get this object properly nested
			// Put the name on the top leve lobject
			formInfo.name = input_obj.name;
			// Delete it from the settings
			delete input_obj.name;
			// Add all the form information under settings
			formInfo.settings = input_obj;
			// Add the defaults, the values of which are extracted one by one
			formInfo.default_event = {};
			if (formInfo.set_default_event) { 
				formInfo.default_event = {
					title: input_obj.title,
					what_happened: input_obj.what_happened,
					significance: input_obj.significance,
					impact_tags: input_obj.impact_tags
				}
			}
			// Delete the default events from the object
			delete input_obj.title;
			delete input_obj.what_happened;
			delete input_obj.significance;
			delete input_obj.impact_tags;
			
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
			// Add the defaults, the values of which are extracted one by one
			formInfo.default_event = {};
			if (formInfo.set_default_event) { 
				formInfo.default_event = {
					title: input_obj.title,
					what_happened: input_obj.what_happened,
					significance: input_obj.significance,
					impact_tags: input_obj.impact_tags
				}
			}
			delete input_obj.title;
			delete input_obj.what_happened;
			delete input_obj.significance;
			delete input_obj.impact_tags;

			return formInfo;
		}
	},
	remodelEventJson: function(alert_id, formInputsArray){
		var input_obj = views.helpers.formSerialToObject(formInputsArray);
		// Add event id that created this event
		input_obj.alert_id = alert_id;
		// Convert timestamp to number
		input_obj.timestamp = +input_obj.timestamp;
		if (input_obj.impact_tags.length) {
			input_obj.impact_tags = input_obj.impact_tags.map(function(impactTag){
				// TODO, replace this `pageData.org.impact_tags object with the data returned by the tags api
				return pageData.org.impact_tags.filter(function(iT){ return iT.name === impactTag})[0].id
			})
		}
		return input_obj;
	}
}