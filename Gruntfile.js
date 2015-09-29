module.exports = function (grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		babel: {
			options: {
				sourceMap: false
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
			target: ["src/*.js"]
		},
		watch : {
			js : {
				files : ["src/*.js"],
				tasks : "default"
			},
			pkg: {
				files : "package.json",
				tasks : "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-eslint");

	// aliases
	grunt.registerTask("test", ["eslint"]);
	grunt.registerTask("build", ["babel"]);
	grunt.registerTask("default", ["build", "test"]);
};
