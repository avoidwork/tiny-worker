"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require("path");
var fork = require("child_process").fork;
var worker = path.join(__dirname, "worker.js");
var events = /^(error|message)$/;

var Worker = (function () {
	function Worker(arg) {
		var _this = this;

		_classCallCheck(this, Worker);

		var isfn = typeof arg === "function",
		    input = isfn ? arg.toString() : arg;

		this.child = fork(worker);
		this.onerror = undefined;
		this.onmessage = undefined;

		this.child.on("error", function (e) {
			if (_this.onerror) {
				_this.onerror.call(_this, e);
			}
		});

		this.child.on("message", function (msg) {
			var message = JSON.parse(msg);
			var error = undefined;

			if (!message.error && _this.onmessage) {
				_this.onmessage.call(_this, message);
			}

			if (message.error && _this.onerror) {
				error = new Error(message.error);
				error.stack = message.stack;

				_this.onerror.call(_this, error);
			}
		});

		this.child.send({ input: input, isfn: isfn });
	}

	_createClass(Worker, [{
		key: "addEventListener",
		value: function addEventListener(event, fn) {
			if (events.test(event)) {
				this["on" + event] = fn;
			}
		}
	}, {
		key: "postMessage",
		value: function postMessage(msg) {
			this.child.send(JSON.stringify({ data: msg }));
		}
	}, {
		key: "terminate",
		value: function terminate() {
			this.child.kill("SIGINT");
		}
	}]);

	return Worker;
})();

module.exports = Worker;
