'use strict';

module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
		clientViews: ['public/modules/**/views/**/*.html'],
		clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
		clientCSS: ['public/modules/**/*.css']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint', 'build:dev'],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint', 'build:dev'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		uglify: {
			prod: {
				options: {
					mangle: true,
					sourceMap: false
				},
				files: {
					'public/dist/application.min.js': 'public/dist/application.min.js'
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/dist/application.min.css': '<%= applicationCSSFiles %>'
				}
			}
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--debug'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS),
					ignore: ['node_modules/**']
				}
			},
			prod: {
				script: 'server.js',
				options: {
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS),
					ignore: ['node_modules/**']
				}
			}
		},
		concat: {
			dev: {
				options: {
					sourceMap: true,
					sourceMapStyle: 'inline'
				},
				src: '<%= applicationJavaScriptFiles %>', 
				dest: 'public/dist/application.js'
			},
			prod: {
				options: {
					sourceMap: false
				},
				src: '<%= applicationJavaScriptFiles %>', 
				dest: 'public/dist/application.js'
			}
		},
		ngAnnotate: {
			dev: {
				options: {
					sourceMap: true
				},
				files: {
					'public/dist/application.min.js': 'public/dist/application.js'
				}
			},
			prod: {
				options: {
					sourceMap: false
				},
				files: {
					'public/dist/application.min.js': 'public/dist/application.js'
				}
			}
		},
		concurrent: {
			dev: ['nodemon:dev', 'watch'],
			prod: ['nodemon:prod'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);

	// Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		var init = require('./config/init')();
		var config = require('./config/config');

		grunt.config.set('applicationJavaScriptFiles', config.assets.js);
		grunt.config.set('applicationCSSFiles', config.assets.css);
	});

	grunt.registerTask('create-admin-user', 'Task that creates an admin user from admin-config.json', function() {
		this.async();
		require("./createAdminUser.js");
	});

	// Default task
	grunt.registerTask('default', [process.env.NODE_ENV || 'development']);

	// Development tasks
	grunt.registerTask('development', ['lint', 'build:dev', 'concurrent:dev']);

	// Production tasks
	grunt.registerTask('production', ['lint', 'build:prod', 'concurrent:prod']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s): Dev
	grunt.registerTask('build:dev', ['loadConfig', 'concat:dev', 'ngAnnotate:dev', 'cssmin']);

	// Build task(s): Prod
	grunt.registerTask('build:prod', ['loadConfig', 'concat:prod', 'ngAnnotate:prod', 'uglify', 'cssmin']);

	// Test task.
	grunt.registerTask('test', ['env:test', 'karma:unit']);
};
