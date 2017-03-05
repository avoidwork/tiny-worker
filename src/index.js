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
		this.child.send(JSON.stringify({data: msg}));
	}

	terminate () {
		this.child.kill("SIGINT");
	}
}

module.exports = Worker;
