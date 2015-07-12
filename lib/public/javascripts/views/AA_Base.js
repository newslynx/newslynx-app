Backbone.View.prototype.killView = function() {

	if (this._time_picker) { this._time_picker.destroy(); }
	this.killAllSubviews();
	this.undelegateEvents();
	this.remove();

	return this;
	
}

Backbone.View.prototype.setGlobalLoading = function() {

	$('body').attr('data-loading', 'internal-link');

	return this;
	
}

Backbone.View.prototype.silenceView = function() {

	this.silenceAllSubviews();
	this.undelegateEvents();
	if (this._time_picker) { this._time_picker.destroy(); }

	return this;

}

Backbone.View.prototype.silenceAllSubviews = function() {

	if (this._subviews && _.isArray(this._subviews)){
		this._subviews.forEach(function(subview){
			subview.silenceView();
		});
		this._subviews = [];
	}

	return this;

}

Backbone.View.prototype.killAllSubviews = function() {

	if (this._subviews && _.isArray(this._subviews)){
		this._subviews.forEach(function(subview){
			subview.killView();
		});
		this._subviews = [];
	}

	return this;

}