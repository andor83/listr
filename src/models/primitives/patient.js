// check if we are in Node.js and use require if so to load modules
if(typeof module !== 'undefined') {
	var moment = require("moment");
	Model = require("./model.js");
	Encounter = require("./encounter.js");
} 
 
/** Primitive class that represents a patient, an actual person.  
 * Stores data that typically does not change from encounter to encounter, as well as notes for "frequent fliers" that will be saved independent of encounter.
 * Designed to be extended by browser (frontend) and node.js (backend) specific models
 * @extends Model
 * @requires Model
 * @requires Moment
 * @requires Encounter
 */
class Patient extends Model {
	
	/**
	 * Constructs a new patient.  Pass an object that is well formatted to populate easliy.  Basic checks are performed but currently no validation is performed at this step
	 * @param {object} new_patient - The object representing the new patient data
	 * @todo add validation of constructor data
	 */
	
	constructor(new_patient) {
		super();
		this._data.mrn = "";
		this._data.name = {
			first: "",
			last: "",
			middle: "",
			prefix: "",
			suffix: ""
		};
		this._data.date_of_birth = new moment();
		this._data.sex = "";
		this._data.notes = "";
		
		this._data.encounters = new Array();
		
		// populate data with 
		if(new_patient !== null && typeof new_patient === 'object') {
			this._set_model_data(new_patient);
		}
	}
	
	/** Calculates the age of the patient based on the current system date/time and returns as a number
	 * @return {number} age of patient in years
	 */
	get age() {
		return moment().diff(this._data.date_of_birth, 'years');
	}
	
	/** The full name of the patient in verbose format with prefix, middle name, and suffix if present.  Assumes a first and last name are set
	 * i.e. Dr. James Charles Monroe Jr.
	 * @return {string} full name of the patient
	 */
	get full_name() {
		let name = "";
		if(this._data.name.prefix != "") name += this._data.name.prefix + " ";
		name += this._data.name.first + " "; 
		if(this._data.name.middle != "") name += this._data.name.middle + " ";
		name += this._data.name.last + " ";
		if(this._data.name.suffix != "") name += this._data.name.suffix + " ";
		
		return name;
	}
	
	/** The short name of the patient, in last_name, first_name format, without any middle, prefix or suffixes.
	 * Intended to be used in places where space is a premium, like the concise list.
	 * @return {string} short name of patient
	 */
	get short_name() {
		return this._data.name.last + ", " + this._data.name.first;
	}
	
	/** The age and sex of a patient in shorthand format. Intended to be used in places where space is a premium
	 * i.e. "32F" or "72M"
	 * @todo Implement a wider spectrum of genders
	 */
	get age_sex() {
		if(this._data.sex != "") {
			if(this._data.sex == "male")
				return this.age() + "M";
			else
				return this.age() + "F";
		} else {
			return "";
		}
	}
	
	/** The patient sex, as a string.
	 * i.e. "woman"
	 * @return {string} sex
	 * @todo add more options for sex
	 */
	get sex() {
		return this._data.sex;
	}
	
	set sex(sex) {
		if(typeof sex !== 'string') throw new Error("sex must be a string");
		
		sex = sex.toLowerCase();
		if(sex == "m" || sex == "male" || sex == "man") { this._data.sex = "male"; return true; }
		else if(sex == "f" || sex == "female" || sex == "woman") { this._data.sex = "female"; return true; }
		else if(typeof this.validate_sex == "function") { this._data.sex = this.validate_sex(sex); return true; }
		else { this._data.sex = sex; return true; }
		
	}
	
	/** The patient MRN number, as a string.  Used to uniquely identify a patient.  Can be used as a key to link to hospital records utilizing a plugin */
	get mrn() {
		if( this._data.mrn && this._data.mrn != "") { return this._data.mrn; }
		else { return "not set"; }
	}
	
	set mrn(mrn) {
		if(typeof mrn != 'string' && typeof mrn != 'number') throw new Error("mrn must be a string or a number")
		if(typeof this.validate_mrn == "function" ) { this._data.mrn = this.validate_mrn(mrn); this.dirty = true; return true; }
		else { this._data.mrn = mrn; return true; }
	}
	
	/** The patient date of birth.  Accepts a date string, a javascript date object, or a moment object (anything that moment accepts).
	 * $return {object} a moment object representing the patients birthdate
	 */
	get date_of_birth() {
		return this._data.date_of_birth;
	}
	
	set date_of_birth(dob) {
		this._data.date_of_birth(new moment(dob));
		this.dirty = true;
		return true;
	}
	
	/** A convenience method which can be used to generate notes.  Produces a sentance starter with the patients age and sex
	 * @return {string} "The patient is a age sex "
	 */
	get description_sentance() {
		return "The patient is a " + this.age + " " + this.sex + " ";
	}
	
	/** This will add an encounter object to the patient record.  If the encounter ID matches, it will be overwritten completely with the new one.
	 * @param {Encounter} new_encounter - the encounter object to add
	 * @return {Encounter} returns the new encounter
	 * @throws Throws an error if an object is passed other than an Encounter
	 */
	add_encounter(new_encounter) {
		if( new_encounter instanceof Encounter) {
			// look for duplicate and splice out if present
			this.delete_encounter_by_id(new_encounter.id);
			
			this._data.encounters.push(new_encounter);
			this.dirty = true;
			return new_encounter;
		} else {
			throw new Error("Attempted to add a non-encounter to the encounters list for patient with MRN (" + this.mrn + ")");
		}		
	}
	
	/** This creates a new encounter and adds it to the list of the patient's encounters 
	 * @return {Encounter} A reference to the newly generated encounter to edit
	 */
	new_encounter() {
		let encounter = new Encounter();
		
		this.add_encounter(encounter);
		
		return encounter
	}
	
	/** Gets an encounter from the encounter list, searching by encounter id.  Returns false if not found
	 * @param {string} id - The id of the encounter to locate
	 * @return {(Encounter|boolean)} The encounter, or false
	 */
	get_encounter_by_id(id) {
		this._data.encounters.forEach(function(e) {
			if(e.id.toLowerCase() == id.toLowerCase()) return e;
		});
		
		return false;
	}
	
	/** Deletes an encounter from the encounter list for a patient, searching by id
	 * @param {string} id - the id of the encounter to delete
	 * @return {boolean} true if found and deleted, false if not found
	 */
	delete_encounter_by_id(id) {
		let encounter = this.get_encounter_by_id(id);
		if(!encounter) return false;
		this._data.encounters(this._data.encounters.indexOf(encounter), 1);
		this.dirty = true;
		
		return true;
	}
	
}

// if in node.js, set exports
if(typeof exports !== 'undefined') module.exports = Patient;