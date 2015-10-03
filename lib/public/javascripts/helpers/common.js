helpers.common = {
	sortNumber: function(a,b) {
		return a - b;
	},
	htmlDecode: function(input){
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes[0].nodeValue;
	},
	toUserTimezone: function(utcDatestamp){
		var utc_moment = moment(utcDatestamp),
				user_timezone_moment = utc_moment.tz(pageData.timezone);
		
		return user_timezone_moment;
	},
	conciseDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MM-DD-YY');

		return user_timezone_string; // returns `6-24-14`
	},
	addCommas: function(x){
		if (x || x === 0){
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			console.log('Warning: Expected string, found', x);
			return '';
		}
	},
	zeroIfNull: function(x) {
		console.log(x)
		if (!x) {
			return 0
		} else {
			return x
		}
	},
	prettyDatestamp: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('M/D/YYYY, h:mm a');

		return user_timezone_string; // returns `9/6/2014, 9:13 am`
	},
	toTitleCase: function(str){
		return (str.charAt(0).toUpperCase() + str.slice(1, str.length));
	},
	boolToStr: function(bool, str){
		var response;
		if (bool){
			response = str;
		} else {
			response = '';
		}
		return response;
	},
	// http://momentjs.com/docs/#/displaying/format/
	prettyDate: function(utcDatestamp){
		var user_timezone_moment = helpers.common.toUserTimezone(utcDatestamp),
				user_timezone_string = user_timezone_moment.format('MMM D, YYYY');

		return user_timezone_string; // returns `Jun 23, 2014`
	},
}
