var childProcess = require('child_process');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: [
        'dist/cjs/**/!(*.min|parser).js'
      ]
    },

    clean: ['tmp', 'dist', 'lib/handlebars/compiler/parser.js'],

    copy: {
      dist: {
        options: {
          processContent: function(content, path) {
            return grunt.template.process('/*!\n\n <%= pkg.name %> v<%= pkg.version %>\n\n<%= grunt.file.read("LICENSE") %>\n@license\n*/\n')
                + content;
          }
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/'}
        ]
      },
      cdnjs: {
        files: [
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/cdnjs'}
        ]
      },
      components: {
        files: [
          {expand: true, cwd: 'components/', src: ['**'], dest: 'dist/components'},
          {expand: true, cwd: 'dist/', src: ['*.js'], dest: 'dist/components'}
        ]
      }
    },

    packager: {
      global: {
        type: 'umd',
        export: 'Handlebars',
        files: [{
          cwd: 'lib/',
          expand: true,
          src: ['handlebars*.js'],
          dest: 'dist/'
        }]
      }
    },
    requirejs: {
      options: {
        optimize: "none",
        baseUrl: "dist/amd/"
      },
      dist: {
        options: {
          name: "handlebars",
          out: "dist/handlebars.amd.js"
        }
      },
      runtime: {
        options: {
          name: "handlebars.runtime",
          out: "dist/handlebars.runtime.amd.js"
        }
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: 'some'
      },
      dist: {
        files: [{
          cwd: 'dist/',
          expand: true,
          src: ['handlebars*.js', '!*.min.js'],
          dest: 'dist/',
          rename: function(dest, src) {
            return dest + src.replace(/\.js$/, '.min.js');
          }
        }]
      }
    },

    concat: {
      tests: {
        src: ['spec/!(require).js'],
        dest: 'tmp/tests.js'
      }
    },

    connect: {
      server: {
        options: {
          base: '.',
          hostname: '*',
          port: 9999
        }
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          urls: ['http://localhost:9999/spec/?headless=true', 'http://localhost:9999/spec/amd.html?headless=true'],
          detailedError: true,
          concurrency: 2,
          browsers: [
            {browserName: 'chrome'},
            {browserName: 'firefox'},
            {browserName: 'safari', version: 7, platform: 'OS X 10.9'},
            {browserName: 'safari', version: 6, platform: 'OS X 10.8'},
            {browserName: 'internet explorer', version: 11, platform: 'Windows 8.1'},
            {browserName: 'internet explorer', version: 10, platform: 'Windows 8'},
            {browserName: 'internet explorer', version: 9, platform: 'Windows 7'}
          ]
        }
      },
      sanity: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          urls: ['http://localhost:9999/spec/umd.html?headless=true', 'http://localhost:9999/spec/amd-runtime.html?headless=true', 'http://localhost:9999/spec/umd-runtime.html?headless=true'],
          detailedError: true,
          concurrency: 2,
          browsers: [
            {browserName: 'chrome'}
          ]
        }
      }
    },

    watch: {
      scripts: {
        options: {
          atBegin: true
        },

        files: ['src/*', 'lib/**/*.js', 'spec/**/*.js'],
        tasks: ['build', 'amd', 'tests', 'test']
      }
    }
  });

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of the current project", [
                    'parser',
                    'globals',
                    'jshint']);

  this.registerTask('globals', ['packager:global']);
  this.registerTask('tests', ['concat:tests']);

  this.registerTask('release', 'Build final packages', ['amd', 'jshint', 'uglify', 'copy:dist', 'copy:components', 'copy:cdnjs']);

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('es6-module-packager');

  grunt.task.loadTasks('tasks');

  grunt.registerTask('bench', ['metrics']);
  grunt.registerTask('sauce', process.env.SAUCE_USERNAME ? ['tests', 'connect', 'saucelabs-mocha'] : []);

  grunt.registerTask('travis', process.env.PUBLISH ? ['default', 'sauce', 'metrics', 'publish:latest'] : ['default']);

  grunt.registerTask('dev', ['clean', 'connect', 'watch']);
  grunt.registerTask('default', ['clean', 'build', 'test', 'release']);
};
