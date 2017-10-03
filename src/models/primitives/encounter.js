// check if we are in Node.js and use require if so to load modules
if(typeof module !== 'undefined') {
	var moment = require("moment");
	Model = require("./model.js");
	var uuidv4 = require("uuid/v4");
	Listr_Utility = require("./listr_util.js");
} 
 
/** Primitive class that represents a patient encounter, which is defined as a contact with the patient. If it is a hospital admission, admit date and discharge date are self explanitory. 
 * If it is a non-admit encounter, the admit date/time will be used as the encounter time
 * Designed to be extended by browser (frontend) and node.js (backend) specific models
 * @extends Model
 * @requires Model
 * @requires Moment
 */
class Encounter extends Model {
	
	/**
	 * Constructs a new patient encounter.  Pass an object that is well formatted to populate easliy.  Basic checks are performed but currently no validation is performed at this step
	 * @param {object} new_encounter - The object representing the new patient encounter data
	 * @todo add validation of constructor data
	 */
	constructor(new_encounter) {
		super();
		
		this._data = Object.assign(this._data, {
			id: "",
			admit_date: new moment(),
			discharge_date: new moment(),
			discharged: false,
			attending_physician: "",
			is_consult: false,
			consulting_services: [],
			diet: "",
			tolerating_diet: false,
			bowel_function: "",
			tld: [],
			alergies: [],
			diagnosies: [],
			intake: [],
			output: [],
			medications: [],
			operations: [],
			pmh: "",
			baseline_exam: "",
			assesment: "",
			events: [],
			imaging_findings: [],
			plan_items: []
		});
		
		// populate data with 
		if(new_encounter !== null && typeof new_encounter === 'object') {
			this._set_model_data(new_encounter);
		}
	}
	
	/** The id of the encounter.  In cerner, this would be the FIN number, but can be any unique number. 	
	 * @type {string}
	 */
	get id() {
		return this._data.id;
	}
	
	set id(id) {
		if(typeof id == "string") { this._data.id = id; this.dirty = true; return true; }
		else { return false; }
	}
	
	/** Generates an id using the uuidv4 module.  Useful if you do not have a standard encounter id format.
	 * @return {string} the new id
	 */
	autogenerate_id() {
		this._data.id = new uuidv4();
		this.dirty = true;
		return this._data.id;
	}
	
	/** Sets the admit date for the encounter.  If the encounter is not an admission (phone call or outpatient procedure) this will be used as the date for this and discharge date is ignored
	 * @type {moment}
	 */
	 set admit_date(d) {
		 this._data.admit_date(new moment(d));
		 this.dirty = true;
		 return this._data.admit_date;
	 }
	 
	 get admit_date() {
		 return this._data.admit_date;
	 }
	
	
}

// if in node.js, set exports
if(typeof exports !== 'undefined') module.exports = Encounter;