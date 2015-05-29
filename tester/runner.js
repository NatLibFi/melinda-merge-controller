"use strict";

var MelindaClient = require('melinda-api-client');
var Controller = require('../lib/MelindaMergeController');
var config = require('./merge_config');
var Q = require('q');
var fs = require('fs');

Q.longStackSupport = true;

var controller = new Controller(config);

var api = {
	endpoint: "http://libtest.csc.fi:8992/API",
	user: "aleph",
	password: "aleph"
};
var client = new MelindaClient(api);

var pairs = JSON.parse(fs.readFileSync('pairs.json', 'utf8'));
console.log(pairs.length);
//
//
//"005200881","000473979"

handleItem(pairs);


//test("004587917","000619437").done();

function handleItem(arr) {
	if (arr.length === 0) {
		console.log("Done");
		return;
	}
	var item = arr.shift();

	test(item[0], item[1]).done(function() {
		handleItem(arr);
	});

}

function test(id1, id2) {
	console.log("CHK", id1, id2);
	return Q.all([
		client.loadRecord(id1),
		client.loadRecord(id2)
	]).then(function(records) {

		return controller.mergeRecords(records[0], records[1]).then(function(result) {
			console.log("OK ", id1, id2);

		}).catch(function(error) {

			if (error instanceof Error) {
				console.log("error");
				console.log(error);
				console.log(error.stack);
				return;
			}
			console.log("ERR", id1, id2);

			var reason = error.error.message;
			
			reason.split("\n").forEach(function(line) {
				console.log("STAT_E] ", line);
			});
			
		});

	});

	

}