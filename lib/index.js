"use strict";

var path = require("path");
var worker = require(path.join(__dirname, "worker.js"));

function factory(arg) {
	var fn = typeof arg === "function",
	    obj = undefined;

	obj = worker(arg, fn);

	return obj;
}

module.exports = factory;
