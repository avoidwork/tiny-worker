const fs = require("fs");
const path = require("path");
const vm = require("vm");
const noop = require(path.join(__dirname, "noop.js"));

function trim (arg) {
	return arg.replace(/^(\s+|\t+|\n+)|(\s+|\t+|\n+)$/g, "");
}

function explode (arg) {
	return trim(arg).split(new RegExp("\\s*,\\s*"));
}

function toFunction (arg) {
	let args = trim(arg.replace(/^.*\(/, "").replace(/[\t|\r|\n|\"|\']+/g, "").replace(/\).*/, "")),
		body = trim(arg.replace(/^.*\{/, "").replace(/\}$/, ""));

	return Function.apply(Function, explode(args).concat([body]));
}

// Bootstraps the Worker
process.once("message", function (obj) {
	let exp = obj.isfn ? toFunction(obj.input) : fs.readFileSync(obj.input, "utf8");

	global.self = {
		close: function () {
			process.exit(0);
		},
		postMessage: function (msg) {
			process.send(JSON.stringify({data: msg}));
		},
		onmessage: undefined,
		onerror: undefined,
		addEventListener: function (event, fn) {
			if (event === "message") {
				global.onmessage = global.self.onmessage = fn;
			}

			if (event === "error") {
				global.onerror = global.self.onerror = fn;
			}
		}
	};

	global.require = require;

	global.importScripts = function (...files) {
		let scripts;

		if (files.length > 0) {
			scripts = files.map(function (file) {
				return fs.readFileSync(file, "utf8");
			}).join("\n");

			vm.createScript(scripts).runInThisContext();
		}
	};

	Object.keys(global.self).forEach(function (key) {
		global[key] = global.self[key];
	});

	process.on("message", function (msg) {
		(global.onmessage || global.self.onmessage || noop)(JSON.parse(msg));
	});

	process.on("error", function (err) {
		(global.onerror || global.self.onerror || noop)(err);
	});

	if (typeof exp === "function") {
		exp();
	} else {
		vm.createScript(exp).runInThisContext();
	}
});
