// MelindaMergeController

(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define([
			'../node_modules/q/q', 
			'marc-record-merge', 
			'./classifier', 
			'record_validator', 
			'MelindaMergeUtils',
			'marc-record-similarity'
		], factory);
	} else if(typeof exports === 'object') {
		module.exports = factory(  // jshint ignore:line
			require('q'),
			require('marc-record-merge'), 
			require('./classifier'), 
			require('./record_validator'), 
			require('marc-record-merge-melindautils'),
			require('marc-record-similarity')
		);
	} 
}(this, function(Q, Merger, classifier, Validator, MelindaMergeUtils, RecordSimilarityChecker) {
	"use strict";

	function constructor(config) {

		var classifierStrategy = config.classifierStrategy;
		
		var merger = new Merger(config.merge);
		var validator = new Validator();
		var mergeUtils = new MelindaMergeUtils(config.melindaUtils);
		var recordSimilarityChecker = new RecordSimilarityChecker(config.similarity);

		// mergeRecords(id1, id2).then(handleOKCase).catch(handleMergeError).done();
		function mergeRecords(record1, record2) {

			var deferred = Q.defer();

			fixRecords([record1, record2])
			.then(classifyRecords)
			.then(function(records) {

				mergeUtils.canMerge(records.other.fixed, records.preferred.fixed).then(function() {

					mergeUtils.applyPreMergeModifications(records.other.fixed, records.preferred.fixed);
					
					var similarity = recordSimilarityChecker.check(records.other.fixed, records.preferred.fixed);
					if (similarity < config.similarity.threshold) {
						return deferred.reject({
							name: "MergeValidationError",
							records: records,
							error: new Error("Record similarity under threshold. Similarity is: " + round(similarity))
						});
					}
					
					console.log("similarity", similarity);
					

					merger.merge(records.preferred.fixed, records.other.fixed).then(function(merged) {
					// this will modify source records: adds info whether the field was used in merge result

						mergeUtils.applyPostMergeModifications(records.other.fixed, records.preferred.fixed, merged).then(function() {
						
							deferred.resolve({
								records: records,
								merged: merged
							});

						}).catch(function(error) {

							deferred.reject({
								records: records,
								error: error
							});
							
						}).done();
					
					}).done();

				}).catch(function(error) {

					deferred.reject({
						name: "MergeValidationError",
						records: records,
						error: error
					});

				}).done();


			}).catch(function(error) {
				deferred.reject(error);
			}).done();

			return deferred.promise;
		}

		function round(num) {
			return Math.round(num*100)/100;
		}

		function fixRecords(records) {

			return Q.all(records.map(function(record) {
				return validator.fix(record).then(function(fixed) {

					return {
						original: record,
						fixed: fixed
					};
				});
			
			}));
		}

		function classifyRecords(recordBundles) {

			var classified = classifier(recordBundles[0].fixed, recordBundles[1].fixed, {strategy: classifierStrategy});

			var classifiedBundles = {
				preferred: (recordBundles[0].fixed === classified.preferred) ? recordBundles[0] : recordBundles[1],
				other: (recordBundles[0].fixed === classified.other) ? recordBundles[0] : recordBundles[1],
			};

			return classifiedBundles;

		}

		return {
			mergeRecords: mergeRecords
		};

	}

	return constructor;
}));
