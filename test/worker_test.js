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
