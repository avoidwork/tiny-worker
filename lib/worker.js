"use strict";

var spawn = require("child_process").spawn;

function factory(arg) {
	var ps = spawn("grep", [arg]);

	ps.on("close", function (code, signal) {
		console.log("child process terminated due to receipt of signal " + signal);
	});

	return ps;
}

module.exports = factory;
