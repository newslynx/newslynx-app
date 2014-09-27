Backbone.View.prototype.killView = function() {

	// console.log('killing', this)
	if (this._time_picker) { this._time_picker.destroy(); }
	this.killAllSubviews();
	this.undelegateEvents();
	this.remove();

}

Backbone.View.prototype.killAllSubviews = function() {

	if (this._subviews && _.isArray(this._subviews)){
		this._subviews.forEach(function(subview){
			subview.killView();
		});
		this._subviews = [];
	}

}