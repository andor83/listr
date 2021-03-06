
// check if we are in Node.js and use require if so to load modules
if(typeof require !== 'undefined') {
	var moment = require("moment");
	var uuidv4 = require("uuid/v4");
	Listr_Utility = require("./listr_util.js");
} 

/** Primitive class that represents a basic model.  All other primitives inherit this.  Has methods to aid in model updating and identificatoin
 * If it is a non-admit encounter, the admit date/time will be used as the encounter time
 * Designed to be extended by browser (frontend) and node.js (backend) specific models
 * @requires Moment
 */
class Model {
	constructor() {
		this._data = {
			uuid: uuidv4(),
			created: moment(),
			updated: moment()
		};
		
		this._on_change_functions = {};
		this._dirty = false;
		this._update_timeout = 1000;
	}
	
	_set_model_data(model_data) {
		Listr_Utility.map_to_left_recursive(this._data, model_data);
		this._dirty = true;
		if(this._onChange()) {
			this._dirty = false;
		} else {
			throw new Error("Onchange function returned false, further onChanges halted");
		}
	}
	
	_onChange() {
		for(var i in this._on_change_functions) {
			if (this._on_change_functions[i].func() === false) return false;
		}
		
		return true;
	}
	
	onChange(func) {
		var n = {
			id: uuid4(),
			func: func
		};
		
		this._on_change_functions[n.id] = n;
		return n.id;
	}
	
	/** Set the value of the update timeout in milliseconds.  Determines the number of milliseconds between an update and the onChange event. Used to gather rapid successive updates and trigger the onChange at a set interval, instead of multiple times in a short period (for updating the server or database for example)
	 * @type {number}
	 * @default 1000
	 */
	 set update_timeout(val) {
		 if(typeof val != "number") return false;
		 
		 if(val < 0) {
			 this._update_timeout = 0;
		 } else {
			 this._update_timeout = val;
		 }
		 
		 return val;
	 }
	 
	 get update_timeout() {
		 return this._update_timeout;
	 }
	
	/** Set the model dirty flag, which is used to signify that the model needs to be updated, which can be done via the onChange event.  On the browser, this can mean sending an updated version of the model to the server, or to tell the server that it needs to save changes to the database
	 * @param {boolean} value - true/false value. If set to true, starts an update timer to trigger the onChange functions at a set time based on the {@link update_timeout} value, so that multiple rapid changes do not trigger several updates.  Setting to false clears the timeout.
	 * @return {boolean} value of dirty
	 */
	set dirty(val) {
		// clear the timer regardless
		if(this.on_change_timer) clearTimeout(this.on_change_timer);
		
		if(typeof val == "undefined" || val === false) { 
			this._dirty = false; 
			return false; 
		} else {	
			this._dirty = true;
			this.on_change_timer = setTimeout( () => { this._onChange() }, this.update_timeout );
		}
	}
	
	get dirty() {
		return this._data.dirty;
	}
}

if(typeof module !== 'undefined') module.exports = Model;

