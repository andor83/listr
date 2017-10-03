// check if we are in Node.js and use require if so to load modules
if(typeof require !== 'undefined') {
	var moment = require("moment");
}

class Listr_Utility {
	static map_to_left_recursive(left, right) {
		for( var i in left) {
			if(moment.isMoment(left[i]) && typeof right[i] != 'undefined' && moment.isMoment(right[i])) {
				left[i] = Object.assign(right[i]);
			} else if(typeof left[i] == 'object' && typeof right[i] == 'object') {
				this.map_to_left_recursive(left[i], right[i]);
			} else {
				if(typeof left[i] == typeof right[i]) left[i] = right[i];
			}
		}
	}
}

if(typeof module !== 'undefined') module.exports = Listr_Utility;
