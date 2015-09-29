const path = require("path");
const worker = require(path.join(__dirname, "worker.js"));

function factory (arg) {
	let fn = typeof arg === "function",
		obj;

	obj = worker(arg, fn);

	return obj;
}

module.exports = factory;
