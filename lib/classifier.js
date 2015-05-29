
(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['MelindaPreferenceSelector', 'underscore'], factory);
	} else if(typeof exports === 'object') {
		module.exports = factory(  // jshint ignore:line
			require('marc-record-contrast'), 
			require('underscore')
		); 
	} else {
		root.classifier = factory(root.MelindaSelector, root._);
	}
}(this, function(MelindaSelector, _) {
	"use strict";

	function byHumanFilter(userName) {
		if (userName === undefined) {
			return false;
		}
		if (userName.substr(0,5) === "LOAD-") {
			return false;
		}
		if (userName.substr(0,5) === "CONV-") {
			return false;
		}
		return true;
	}

	var lexicalNormalizer = function(currentValue, otherValue) {
		return (currentValue > otherValue) ? 1 : 0;
	};
	var reverseLexicalNormalizer = function(currentValue, otherValue) {
		return (currentValue >= otherValue) ? 0 : 1;
	};
	var nullNormalizer = function(currentValue, otherValue) {
		if (otherValue === null) {
			if (currentValue !== null) {
				return 1;
			} else {
				return 0;
			}
		}
		return 0;
	};

	var invertScores = function(currentValue, otherValue) {
		return otherValue;
	};

	function classify(record1, record2, opts) {

		var selector = new MelindaSelector();

		var selectorConfig = [
			{ extractor: selector.extractEncodingLevel, normalizer: nullNormalizer },
			{ extractor: selector.extractCatalogingSourceFrom008 },
			{ extractor: selector.extractRecordAge, normalizer: lexicalNormalizer },
			{ extractor: selector.extractLocalOwnerCount },
			{ extractor: selector.extractLatestChange(byHumanFilter), normalizer: lexicalNormalizer },
			{ extractor: selector.extractSpecificLocalOwner("FENNI") },
			{ extractor: selector.extractSpecificLocalOwner("VIOLA") },
			{ extractor: selector.extractFieldCount("650") },
			{ extractor: selector.extractPublicationYear, normalizer: reverseLexicalNormalizer },
			{ extractor: selector.extractSpecificFieldValue('042', ['a'], 'finb') },
			{ extractor: selector.extractFieldLength('250') },
			{ extractor: selector.extractNonFinnishHELKA },
			{ extractor: selector.extractSpecificSingleLocalOwner("VAARI"), normalizer: invertScores }
		];

		var r1vector = selector.generateFeatureVector(record1, _(selectorConfig).pluck('extractor'));
		var r2vector = selector.generateFeatureVector(record2, _(selectorConfig).pluck('extractor'));

		selector.normalizeVectors(r1vector, r2vector,  _(selectorConfig).pluck('normalizer'));

		var preferred = selectPreferred(r1vector, r2vector, opts);
		if (preferred == r1vector) {
			return {
				preferred: record1,
				other: record2
			};
		} else {
			return {
				preferred: record2,
				other: record1
			};
		}
	}

	function selectPreferred(vector1, vector2, opts) {
		opts = opts || {};
		if (opts.strategy === undefined) {
			throw new Error("Missing strategy for selecting preferred record");
		}

		var sumVector = vector1.map(function(value, index) {
			return value + vector2[index];
		});

		var weightedVector1 = vector1.map(normalize).map(weighted);
		var weightedVector2 = vector2.map(normalize).map(weighted);

		var v1Sum = weightedVector1.reduce(sum, 0);
		var v2Sum = weightedVector2.reduce(sum, 0);

		if (v1Sum > v2Sum) {
			return vector1;
		} else {
			return vector2;
		}

		function sum(memo, item) {
			return memo+item;
		}

		function weighted(item, i) {
			return item * opts.strategy.weights[i];
		}

		function normalize(value, i) {
			if (value === 0) { return 0; }
			return value / sumVector[i];
		}

	}

	return classify;
}));