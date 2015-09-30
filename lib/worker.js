"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var noop = require(path.join(__dirname, "noop.js"));

function trim(arg) {
	return arg.replace(/^(\s+|\t+|\n+)|(\s+|\t+|\n+)$/g, "");
}

function explode(arg) {
	return trim(arg).split(new RegExp("\\s*,\\s*"));
}

function toFunction(arg) {
	var args = trim(arg.replace(/^.*\(/, "").replace(/[\t|\r|\n|\"|\']+/g, "").replace(/\).*/, "")),
	    body = trim(arg.replace(/^.*\{/, "").replace(/\}$/, ""));

	return Function.apply(Function, explode(args).concat([body]));
}

// Bootstraps the Worker
process.once("message", function (obj) {
	var exp = obj.isfn ? toFunction(obj.input) : fs.readFileSync(obj.input, "utf8"),
	    sexp = undefined;

	global.self = {
		postMessage: function postMessage(msg) {
			process.send(JSON.stringify({ data: msg }));
		},
		onmessage: noop,
		onerror: noop,
		addEventListener: function addEventListener(event, fn) {
			if (event === "message") {
				global.onmessage = global.self.onmessage = fn;
			}

			if (event === "error") {
				global.onerror = global.self.onerror = fn;
			}
		}
	};

	global.importScripts = function () {
		var script = undefined,
		    scripts = undefined;

		for (var _len = arguments.length, files = Array(_len), _key = 0; _key < _len; _key++) {
			files[_key] = arguments[_key];
		}

		if (files.length > 0) {
			scripts = files.map(function (file) {
				return fs.readFileSync(file, "utf8");
			}).join("\n");

			script = vm.createScript(scripts);
			script.runInThisContext();
		}
	};

	Object.keys(global.self).forEach(function (key) {
		global[key] = global.self[key];
	});

	process.on("message", function (msg) {
		(global.self.onmessage || global.onmessage || noop)(JSON.parse(msg));
	});

	process.on("error", function (err) {
		(global.self.onerror || global.onerror || noop)(err);
	});

	if (typeof exp === "function") {
		exp();
	} else {
		sexp = vm.createScript(exp);
		sexp.runInThisContext();
	}
});
