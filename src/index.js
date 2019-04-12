const path = require("path"),
	fork = require("child_process").fork,
	worker = path.join(__dirname, "worker.js"),
	events = /^(error|message)$/,
	defaultPorts = {inspect: 9229, debug: 5858};
let range = {min: 1, max: 300};

class Worker {
	constructor (arg, args = [], options = {cwd: process.cwd()}) {
		let isfn = typeof arg === "function",
			input = isfn ? arg.toString() : arg;

		if (!options.cwd) {
			options.cwd = process.cwd();
		}

		//get all debug related parameters
		var debugVars = process.execArgv.filter(execArg => {
			return (/(debug|inspect)/).test(execArg);
		});
		if (debugVars.length > 0 && !options.noDebugRedirection) {
			if (!options.execArgv) { //if no execArgs are given copy all arguments
				debugVars = Array.from(process.execArgv);
				options.execArgv = [];
			}

			let inspectIndex = debugVars.findIndex(debugArg => { //get index of inspect parameter
				return (/^--inspect(-brk)?(=\d+)?$/).test(debugArg);
			});

			let debugIndex = debugVars.findIndex(debugArg => { //get index of debug parameter
				return (/^--debug(-brk)?(=\d+)?$/).test(debugArg);
			});

			let portIndex = inspectIndex >= 0 ? inspectIndex : debugIndex; //get index of port, inspect has higher priority

			if (portIndex >= 0) {
				var match = (/^--(debug|inspect)(?:-brk)?(?:=(\d+))?$/).exec(debugVars[portIndex]); //get port
				var port = defaultPorts[match[1]];
				if (match[2]) {
					port = parseInt(match[2]);
				}
				debugVars[portIndex] = "--" + match[1] + "=" + (port + range.min + Math.floor(Math.random() * (range.max - range.min))); //new parameter

				if (debugIndex >= 0 && debugIndex !== portIndex) { //remove "-brk" from debug if there
					match = (/^(--debug)(?:-brk)?(.*)/).exec(debugVars[debugIndex]);
					debugVars[debugIndex] = match[1] + (match[2] ? match[2] : "");
				}
			}
			options.execArgv = options.execArgv.concat(debugVars);

		}

		delete options.noDebugRedirection;

		this.child = fork(worker, args, options);
		this.onerror = undefined;
		this.onmessage = undefined;

		this.child.on("error", e => {
			if (this.onerror) {
				this.onerror.call(this, e);
			}
		});

		this.child.on("message", msg => {
			const message = JSON.parse(msg);
			let error;

			if (!message.error && this.onmessage) {
				this.onmessage.call(this, message);
			}

			if (message.error && this.onerror) {
				error = new Error(message.error);
				error.stack = message.stack;

				this.onerror.call(this, error);
			}
		});

		this.child.send({ input: input, isfn: isfn, cwd: options.cwd, esm: options.esm, source: options.source });
	}

	static setRange (min, max) {
		if (min >= max) {
			return false;
		}
		range.min = min;
		range.max = max;

		return true;
	}

	addEventListener (event, fn) {
		if (events.test(event)) {
			this["on" + event] = fn;
		}
	}

	postMessage (msg) {
		this.child.send(JSON.stringify({data: msg}, null, 0));
	}

	terminate () {
		this.child.kill("SIGINT");
	}
}

module.exports = Worker;
