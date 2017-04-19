const path = require("path"),
	fork = require("child_process").fork,
	worker = path.join(__dirname, "worker.js"),
	events = /^(error|message)$/;

class Worker {
	constructor (arg, args = undefined, options = {cwd: process.cwd()}) {
		let isfn = typeof arg === "function",
			input = isfn ? arg.toString() : arg;

		if (!options.cwd) {
			options.cwd = process.cwd();
		}

		//get all debug related parameters
		var debugVars = process.execArgv.filter(execArg => {
			return (/(debug|inspect)/).test(execArg);
		});
		if (debugVars.length > 0) {
			if (!options.execArgv) { //if no execArgs are given copy all arguments
				debugVars = process.execArgv;
				options.execArgv = [];
			}

			let portIndex = debugVars.findIndex(debugArg => { //get index of debug port specifier
				return (/^--(debug|inspect)(-brk)?(=\d+)?$/).test(debugArg);
			});

			if (portIndex >= 0) { //set new port, ignore "-brk", it doesn't work
				debugVars[portIndex] = ((/^--debug/).test(debugVars[portIndex]) ? "--debug=" : "--inspect=") + (process.debugPort + 1);
			}
			options.execArgv = options.execArgv.concat(debugVars);

		}

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

		this.child.send({input: input, isfn: isfn, cwd: options.cwd});
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
