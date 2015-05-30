views.SettingSingle = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// If we've defined a `template` and a `parentEl` this view can render 
		this.render();

		// Cache some initial values and set listeners
		this.initializeBase();
		
		// Load initial value from data
		// If we want to according to `keepPreviousValueIfExists`
		this.setVal();


		// Do some post initialization setup
		this.postRender();

		return this;
	},

	render: function(){
		if (this.options.template && this.options.parentEl){
			this.$el.html(this.options.template(this.model.toJSON()));
			$(this.options.parentEl).append(this.el);
		}

		return this;

	},

	setVal: function(){
		var val = this.getVal();
		var $input = this.$form.find('.js-input-item');
		var existing_value = $input.val() || '';

		if (!this.keepPreviousValueIfExists || (this.keepPreviousValueIfExists && !existing_value.trim()) ){
			$input.val(val);
		}

		return this;
	}


});

// TODO, fix this in build process
views.SettingListItem = views.SettingSingle.extend({

	tagName: 'li'

});