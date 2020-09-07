var path = require("path"),
	Worker = require(path.join("..", "lib", "index.js"));

exports["external script"] = {
	setUp: function (done) {
		this.worker = new Worker(path.join(__dirname, "worker_repeater.js"));
		this.msg = "Hello World!";
		this.response = "";
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onmessage = function (ev) {
			self.response = ev.data;
			self.worker.terminate();
			test.equal(self.msg, self.response, "Should be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function (ev) {
				postMessage(ev.data);
			};
		});
		this.msg = "Hello World!";
		this.response = "";
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onmessage = function (ev) {
			self.response = ev.data;
			self.worker.terminate();
			test.equal(self.msg, self.response, "Should be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - error"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function (ev) {
				throw new Error(ev.data);
			};
		});
		this.msg = "Something went wrong";
		this.response = "";

		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onerror = function (err) {
			self.response = err.message;
			self.worker.terminate();
			test.equal(self.msg, self.response, "Should be a match");
			test.notEqual(err.stack, undefined, "Should not be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - require"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function () {
				postMessage(typeof require);
			};
		});
		this.msg = "What is require?";
		this.expected = "function";
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onmessage = function (ev) {
			self.response = ev.data;
			self.worker.terminate();
			test.equal(self.expected, self.response, "Should be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - __dirname"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function () {
				postMessage(typeof __dirname);
			};
		});
		this.msg = "What is __dirname?";
		this.expected = "string";
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onmessage = function (ev) {
			self.response = ev.data;
			self.worker.terminate();
			test.equal(self.expected, self.response, "Should be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - __filename"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function () {
				postMessage(typeof __filename);
			};
		});
		this.msg = "What is __filename?";
		this.expected = "string";
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onmessage = function (ev) {
			self.response = ev.data;
			self.worker.terminate();
			test.equal(self.expected, self.response, "Should be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - kill"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function () {
				process.kill(process.pid, "SIGSEGV");
			};
		});
		this.msg = "Terminated with signal SIGSEGV";
		this.response = "";

		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onerror = function (err) {
			self.response = err.message;
			self.worker.terminate();
			test.equal(self.msg, self.response, "Should be a match");
			test.notEqual(err.stack, undefined, "Should not be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};

exports["inline script - exit code"] = {
	setUp: function (done) {
		this.worker = new Worker(function () {
			self.onmessage = function () {
				process.exit(1);
			};
		});
		this.msg = "Exit code 1";
		this.response = "";

		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		test.notEqual(this.msg, this.response, "Should not match");

		this.worker.onerror = function (err) {
			self.response = err.message;
			self.worker.terminate();
			test.equal(self.msg, self.response, "Should be a match");
			test.notEqual(err.stack, undefined, "Should not be a match");
			test.done();
		};

		this.worker.postMessage(this.msg);
	}
};
