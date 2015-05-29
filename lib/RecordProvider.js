(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['q', 'jquery'], factory);
	} else if(typeof exports === 'object') {
		module.exports = factory( // jshint ignore:line
			require('q'), 
			require('axios')
		);
	} 
}(this, function(Q, $) {
	"use strict";
	
	function getRecord(id) {

		var url = "http://localhost:3000/record/pre/" + id;

		return $.get(url).then(function(response) {
			return response.data;
		});

	}

	function getRecord2(id) {

		var url = "http://localhost:3000/record/aft/" + id;
		return Q($.get(url));

	}
	return {
		getRecord: getRecord,
		getRecord2: getRecord2
	};
}));