//const path = require("path");

"use strict";

function factory(arg) {
	var fn = typeof arg === "function";

	return fn;
}

module.exports = factory;
