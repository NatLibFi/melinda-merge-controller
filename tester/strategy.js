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
/*	{ extractor: selector.extractEncodingLevel, normalizer: nullNormalizer },
	{ extractor: selector.extractCatalogingSourceFrom008 },
	{ extractor: selector.extractRecordAge, 		normalizer: lexicalNormalizer },
	{ extractor: selector.extractLocalOwnerCount },
	{ extractor: selector.extractLatestChange(byHumanFilter), 	normalizer: lexicalNormalizer },
	{ extractor: selector.extractSpecificLocalOwner("FENNI") },
	{ extractor: selector.extractSpecificLocalOwner("VIOLA") },
	{ extractor: selector.extractFieldCount("650") },
	{ extractor: selector.extractPublicationYear, normalizer: reverseLexicalNormalizer },
	{ extractor: selector.extractSpecificFieldValue('042', ['a'], 'finb') },
	{ extractor: selector.extractFieldLength('250') },
	{ extractor: selector.extractNonFinnishHELKA },
	{ extractor: selector.extractSpecificSingleLocalOwner("VAARI"), normalizer: invertScores }

*/
(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if(typeof exports === 'object') {
		module.exports = factory();  // jshint ignore:line
	} else {
		root.MelindaPreferenceStrategy = factory();
	}
}(this, function() {
	"use strict";

	var strategy = { 
	  weights:   [ 20, 823, 80, 255, 198, 637, 747, 223, 568, 690, 186, 69, 916 ], 
	 // weights: [ 38, 921, 83, 551, 129, 928, 204, 292, 573 ],
	 // weights: [ 1, 11, 1, 15, 15, 13, 14, 13 ],
	  adjusts: [ 'qi', 'qi', 'qd', 'li', 'qd', 'ld', 'li', 'li', 'ld' ],
	  names: [ "ENL", "CSO", "AGE", "LOW", "LCH", "FEN", "VIO", "650", "PDA", "042", "250", "HEL", "VAA"]
	};

	return strategy;
}));
