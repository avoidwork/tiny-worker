const fs = require("fs");
const path = require("path");
const vm = require("vm");
const noop = require(path.join(__dirname, "noop.js"));
const events = /^(error|message)$/;

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
process.once("message", obj => {
	let exp = obj.isfn ? toFunction(obj.input) : fs.readFileSync(obj.input, "utf8");

	global.self = {
		close: () => {
			process.exit(0);
		},
		postMessage: msg => {
			process.send(JSON.stringify({data: msg}));
		},
		onmessage: void 0,
		onerror: void 0,
		addEventListener: (event, fn) => {
			if (events.test(event)) {
				global["on" + event] = global.self["on" + event] = fn;
			}
		}
	};

	global.__dirname = __dirname;
	global.__filename = __filename;
	global.require = require;

	global.importScripts = (...files) => {
		let scripts;

		if (files.length > 0) {
			scripts = files.map(file => {
				return fs.readFileSync(file, "utf8");
			}).join("\n");

			vm.createScript(scripts).runInThisContext();
		}
	};

	Object.keys(global.self).forEach(key => {
		global[key] = global.self[key];
	});

	process.on("message", msg => {
		(global.onmessage || global.self.onmessage || noop)(JSON.parse(msg));
	});

	process.on("error", err => {
		(global.onerror || global.self.onerror || noop)(err);
	});

	if (typeof exp === "function") {
		exp();
	} else {
		vm.createScript(exp).runInThisContext();
	}
});
