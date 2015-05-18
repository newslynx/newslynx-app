views.SettingSingle = views.AA_BaseSetting.extend({

	keepPreviousValueIfExists: true,

	viewInitialize: function(){
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();

		// Add cancel and save buttons
		this.bakeInputActions();

		return this;
	},

	setVal: function(){
		var val = this.model.get('value');
		var $input = this.$form.find('.js-input-item');
		var existing_value = $input.val() || '';

		if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
			this.$form.find('.js-input-item').val(val);
		}

		return this;
	}

});