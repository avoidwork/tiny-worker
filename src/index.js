const path = require("path");
const fork = require("child_process").fork;
const worker = path.join(__dirname, "worker.js");
const events = /^(error|message)$/;

class Worker {
	constructor (arg) {
		let isfn = typeof arg === "function",
			input = isfn ? arg.toString() : arg;

		this.child = fork(worker);
		this.onerror = undefined;
		this.onmessage = undefined;

		this.child.on("error", e => {
			if (this.onerror) {
				this.onerror.call(this, e);
			}
		});

		this.child.on("message", msg => {
			if (this.onmessage) {
				this.onmessage.call(this, JSON.parse(msg));
			}
		});

		this.child.send({input: input, isfn: isfn});
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
		this.child.kill("SIGHUP");
	}
}

module.exports = Worker;
