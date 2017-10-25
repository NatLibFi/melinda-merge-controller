/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Integrates bunch of modules to handle record checking and merging in Melinda union catalogue.
*
* Copyright (C) 2015, 2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge-controller
*
* melinda-merge-controller program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge-controller is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
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

				mergeUtils.applyPreMergeModifications(records.other.fixed, records.preferred.fixed);
				
				mergeUtils.canMerge(records.other.fixed, records.preferred.fixed)
				.progress(function(msg) { deferred.notify(msg); })
				.then(function() {

					try {
						var similarity = recordSimilarityChecker.check(records.other.fixed, records.preferred.fixed);
					} catch(error) {
						error.name = "MergeValidationError";
						error.records = records;
						return deferred.reject(error);
					}

					deferred.notify("Similarity probability: " + similarity);

					if (similarity < config.similarity.threshold) {

						var validationError = new Error( "Record similarity probability under threshold. Similarity probability is: " + round(similarity) );
						validationError.name = "MergeValidationError";
						validationError.records = records;
						
						return deferred.reject(validationError);
					}
					
					merger.merge(records.preferred.fixed, records.other.fixed).then(function(merged) {
					// this will modify source records: adds info whether the field was used in merge result

						mergeUtils.applyPostMergeModifications(records.other.fixed, records.preferred.fixed, merged)
						.progress(function(msg) { deferred.notify(msg); })
						.then(function() {
						
							deferred.resolve({
								records: records,
								merged: merged
							});

						}).catch(function(error) {
							error.records = records;
							deferred.reject(error);
							
						}).done();
					}).catch(function(error) {

						deferred.reject(error);
						
					}).done();

				}).catch(function(error) {

					error.records = records;
					deferred.reject(error);

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
