(function() {
	"use strict";

	var validators = [
		"Alias", 
		"QualifyingInformation"
	];

	var deps = ['q', 'Validation', 'RecordModel'].concat(validators.map(validatorPath));

	function validatorPath(name) {
		return "./libs/marc-record-validate/validators/" + name;
	}

	(function(root, factory) {

		if (typeof define === 'function' && define.amd) {
			define(deps, factory);
		} else if(typeof exports === 'object') {
			module.exports = factory( // jshint ignore:line
				require('q'), 
				require('marc-record-validate/Validation'), 
				require('marc-record-validate/RecordModel'),
				require('marc-record-js')

			);
		} 
	}(this, function(Q, Validation, RecordModel, Record /** rest are validators, see first line of the function */) {

		var validators = Array.prototype.slice.call(arguments).slice(4);

		function constructor() {

			var runner = new Validation();

			validators.forEach(function(Validator) {
				runner.registerValidator( new Validator() );
			});

			function toRecordModel(marc_record_js) {
				
				var clone = JSON.parse(JSON.stringify(marc_record_js));

				var fields = clone.fields;
				fields.unshift({tag: 'LDR', value: clone.leader });
				fields = fields.map(function(field) {

					if (isControlField(field)) {
						return {
							type: 'controlfield',
							tag: field.tag,
							content: field.value,
							_validation: {}
						};
					} else {
						return {
							type: 'datafield',
							tag: field.tag,
							indicator1: field.ind1,
							indicator2: field.ind2,
							subfields: field.subfields.map(function(sub) {
								return { code: sub.code, content: sub.value };
							}),
							_validation: {}
						};
					}
					function isControlField(field) {
						var controlFieldList = ["LDR", "FMT", "001", "002", "003", "004", "005", "006", "007", "008", "009"];
						return (controlFieldList.indexOf(field.tag) !== -1);
					}
				});
			
				return new RecordModel.RecordModel({fields: fields});
			}

			function fromRecordModel(recordModel) {
				var recordModelFields = recordModel.getFields();
				var marc_record_js = {
					fields: []
				};

				recordModelFields.forEach(function(field) {
					if (field.tag == "LDR") {
						marc_record_js.leader = field.content;
						return;
					}

					if (field.type == "controlfield") {
						marc_record_js.fields.push({
							tag: field.tag,
							value: field.content
						});
					}

					if (field.type == "datafield") {
						marc_record_js.fields.push({
							tag: field.tag,
							ind1: field.indicator1,
							ind2: field.indicator2,
							subfields: field.subfields.map(function(sub) {
								return { code: sub.code, value: sub.content };
							})
						});
					}

				});
				return new Record(marc_record_js);
			}

			function validate(record) {
				var deferred = Q.defer();
				var recordModel = toRecordModel(record);
				
				runner.validate(recordModel, recordModel.getFields(),  function(validatedRecord) {
					
					deferred.resolve( fromRecordModel(validatedRecord) );

				});

				return deferred.promise;
			}


			// fix is called recursively until there are no more fixes available.
			function fix(record) {

				var deferred = Q.defer();
				var recordModel = toRecordModel(record);
			
				runFixerForRecordModel(recordModel).then(function(fixedRecordModel) {
					var fixedRecord = fromRecordModel(fixedRecordModel);
					deferred.resolve( fixedRecord );
				});

				return deferred.promise;
			}

			function runFixerForRecordModel(recordModel) {
				var deferred = Q.defer();

				var recordChanged = false;
				
				runner.validate(recordModel, recordModel.getFields(),  function(validatedRecord) {
					
					validatedRecord.getFields().forEach(function(field) {
						Object.keys(field._validation).forEach(function(validatorName) {
							console.log(field._validation);

							//var message = field._validation[validatorName].message;

							// TODO: what to do with multiple actions?
							if (field._validation[validatorName].actions !== undefined && 
								field._validation[validatorName].actions.length > 0) {
	
								var action = field._validation[validatorName].actions[0].name;
								runner.fix(validatorName, action, recordModel, field, null);
								recordChanged = true;
							}
						
						});
						
					});
					if (recordChanged) {
						runFixerForRecordModel(validatedRecord).then(function(record) {
							deferred.resolve( record );
						});
					} else {
						deferred.resolve( validatedRecord );
					}
				});
				return deferred.promise;
			}

			return {
				validate: validate,
				fix: fix,
				toRecordModel: toRecordModel
			};

		}

		return constructor;
	}));

})();