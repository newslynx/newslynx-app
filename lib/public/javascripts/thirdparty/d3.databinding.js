/*!
 *
 * https://groups.google.com/forum/#!topic/d3-js/xJVirdXdaLw
 *
 * var sourceData = [4, 8, 15, 16, 23, 42];
 * NEW function  .enter().append("input").bind(sourceData, validationFunction)
 *
 *
 * var sourceData = { nums: [4, 8, 15, 16, 23, 42] };
 * NEW function  .enter().append("input").bind(sourceData.nums, validationFunction)
 *
 * var sourceData = { "nums": [ { "id": 1, "data": 4 }, { "id": 2, "data": 8 }, { "id": 3, .....
 * NEW function  .enter().append("input").bind(sourceData.nums, 'data', validationFunction)
 *
 **/
d3.selection.prototype.bind = function(target, field, validationFunction) {
	if (!(validationFunction) && (field) && (field.constructor) && (field.call)) {
		validationFunction = field;
		field = null;
	}
	this.each(function(d, i) {
		if ((this.toString() === '[object HTMLInputElement]') || (this.toString() === "[object HTMLTextAreaElement]")) {
			this['Data-BindingTarget'] = target;
			this['Data-BindingPath'] = i;
			this['Data-BindingField'] = field;
		}
	});
	this.on("keyup.bindingData", function(d, i) {
		if ((this.toString() === '[object HTMLInputElement]') || (this.toString() === "[object HTMLTextAreaElement]")) {
			if (!(validationFunction) || (validationFunction(d, i, this.value))) {
				if (this['Data-BindingField']) {
					var fieldName = this['Data-BindingField'];
					this['Data-BindingTarget'][this['Data-BindingPath']][fieldName] = this.value;
				} else {
					this['Data-BindingTarget'][this['Data-BindingPath']] = this.value;
				}
			}
		}
	});
	return this;
};