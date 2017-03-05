module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		babel: {
			options: {
				sourceMap: false,
				presets: ["babel-preset-es2015"]
			},
			dist: {
				files: [{
					expand: true,
					cwd: "src",
					src: ["*.js"],
					dest: "lib",
					ext: ".js"
				}]
			}
		},
		eslint: {
			target: [
				"Gruntfile.js",
				"src/*.js",
				"test/*_test.js"
			]
		},
		nodeunit: {
			all: ["test/*_test.js"]
		},
		watch: {
			js: {
				files: ["src/*.js"],
				tasks: "default"
			},
			pkg: {
				files: "package.json",
				tasks: "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-eslint");

	// aliases
	grunt.registerTask("test", ["eslint", "nodeunit"]);
	grunt.registerTask("build", ["babel"]);
	grunt.registerTask("default", ["build", "test"]);
};
