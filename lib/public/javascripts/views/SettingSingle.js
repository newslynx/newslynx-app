views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();

		// Add cancel and save buttons
		this.bakeInputActions();

		// Determine whether this data is changed or not on load
		// Most browsers will preserve the values in the input field on page refresh
		// This will let us know if those values on load are different from what's stored in our data model
		this.compareFormData();

		return this;
	},

	setVal: function(){
		var val = this.model.get(this.options.valueKey);
		var $input = this.$form.find('.js-input-item');
		var existing_value = $input.val() || '';

		if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
			$input.val(val);
		}

		return this;
	}

});