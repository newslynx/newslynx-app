views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();

		// Do some post initialization setup
		this.postRender();

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