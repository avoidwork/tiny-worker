"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require("path"),
    fork = require("child_process").fork,
    worker = path.join(__dirname, "worker.js"),
    events = /^(error|message)$/;

var Worker = function () {
	function Worker(arg) {
		var _this = this;

		var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { cwd: process.cwd() };

		_classCallCheck(this, Worker);

		var isfn = typeof arg === "function",
		    input = isfn ? arg.toString() : arg;

		if (!options.cwd) {
			options.cwd = process.cwd();
		}

		//get all debug related parameters
		var debugVars = process.execArgv.filter(function (execArg) {
			return (/(debug|inspect)/.test(execArg)
			);
		});
		if (debugVars.length > 0) {
			if (!options.execArgv) {
				//if no execArgs are given copy all arguments
				debugVars = process.execArgv;
				options.execArgv = [];
			}

			var portIndex = debugVars.findIndex(function (debugArg) {
				//get index of debug port specifier
				return (/^--(debug|inspect)(-brk)?\d*/.test(debugArg)
				);
			});

			if (portIndex >= 0) {
				//set new port, ignore "-brk", it doesn't work
				debugVars[portIndex] = (/^--debug/.test(debugVars[portIndex]) ? "--debug=" : "--inspect=") + (process.debugPort + 1);
			}
			options.execArgv = options.execArgv.concat(debugVars);
		}

		this.child = fork(worker, args, options);
		this.onerror = undefined;
		this.onmessage = undefined;

		this.child.on("error", function (e) {
			if (_this.onerror) {
				_this.onerror.call(_this, e);
			}
		});

		this.child.on("message", function (msg) {
			var message = JSON.parse(msg);
			var error = void 0;

			if (!message.error && _this.onmessage) {
				_this.onmessage.call(_this, message);
			}

			if (message.error && _this.onerror) {
				error = new Error(message.error);
				error.stack = message.stack;

				_this.onerror.call(_this, error);
			}
		});

		this.child.send({ input: input, isfn: isfn, cwd: options.cwd });
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
			this.child.send(JSON.stringify({ data: msg }, null, 0));
		}
	}, {
		key: "terminate",
		value: function terminate() {
			this.child.kill("SIGINT");
		}
	}]);

	return Worker;
}();

module.exports = Worker;
