views.SettingPassword = views.AA_BaseSetting.extend({

	initialize: function(options){
		this.options = options;

		// Cache some initial values and set listeners
		this.initializeBase();

		var $oldField			= this.getPasswordEl('old');
		var $newField 		= this.getPasswordEl('new');
		var $confirmField = this.getPasswordEl('confirm');

		this.fields = [$oldField, $newField, $confirmField];

		this.listenTo(this.model, 'change:data_needs_correction', this.setDataCorrection);
		this.model.set('patch', true);

		// Do some post initialization setup
		this.postRender();

		return this;
	},

	inputHasChanged: function(e){
		e.preventDefault();
		e.stopPropagation();
		// Save the input to an attribute unless we just hit the return key
		// In that case, submit the form
		var return_key_code = 13,
				esc_key_code = 27,
				incoming_val;

		if (e.keyCode == return_key_code){
			this.saveModel(e);
		} else if (e.keyCode == esc_key_code){
			this.revertToPreviousSettingVal(e);
		} else {
			incoming_val = this.getCurrentFormData();
			this.model.set('input_val', incoming_val);
			console.log(incoming_val)
			this.compareFormData();
		}

		return this;
	},
	getPasswordEl: function(which){
		return this.$form.find('input[type="password"][data-which="'+which+'"]');
	},

	setDataCorrection: function(model, value){
		this.$form.attr('data-needs-correction', value.toString());
		return this;
	},

	compareFormData: function(){
		var old_password = this.getPasswordEl('old').val(),
				new_password = this.getPasswordEl('new').val(),
				confirm_password = this.getPasswordEl('confirm').val(),
				all_good = (old_password && new_password && (new_password === confirm_password));

		if (old_password || new_password || confirm_password){
			this.flagErrors();
		}
		
		var confirm_error = ((new_password || confirm_password) && (new_password != confirm_password) ) ? true : false;
		console.log('error',confirm_error);
		this.flagErrors(this.getPasswordEl('confirm'), confirm_error);


		console.log('new',new_password)
		console.log('confirm',confirm_password)

		this.model.set('data_changed', all_good);

		return this;
	},

	revertToPreviousSettingVal: function(){
		this.model.set('data_changed', 'false');
		this.model.set('data_inputted', 'false');

		this.fields.forEach(function($el){
			$el.val('');
		});

		return true;
	},

	flagErrors: function($el, needsCorrection){
		if ($el){
			$el.toggleClass('js-needs-correction', needsCorrection);
		} else {
			this.fields.forEach(function($el){
				var val = $el.val().trim(),
						is_empty = val == '';

				$el.toggleClass('js-needs-correction', is_empty);
			})
			
		}
	}

});