//const path = require("path");

function factory (arg) {
	let fn = typeof arg === "function";

	return fn;
}

module.exports = factory;
