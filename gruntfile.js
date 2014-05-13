// Gruntfile.js
module.exports = function (grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
    // shows how long a grunt tasks takes. remove it if you don't care
    require('time-grunt')(grunt);

    grunt.initConfig({
      // setup directories and other variables
      options: {
        folder: {
            create: grunt.template.today("yyyymmddHHMMss"),
            current: grunt.file.readJSON('version'),
            public: '<%= options.folder.current %>/src/public/assets',
            assets: '<%= options.folder.current %>/src/app/assets',
            bower: '<%= options.folder.current %>/src/bower_components',
            node: '<%= options.folder.current %>/src/node_modules',
            composer: '<%= options.folder.current %>/src/vendor',
        },
        url: 'git@git.assembla.com:sibreport.laravel.git' ,
        clean: {
            all: [
              '<%= options.folder.public %>/js/frontend.js',
              '<%= options.folder.public %>/js/backend.js',
              '<%= options.folder.public %>/css/backend.css',
              '<%= options.folder.public %>/css/frontend.css',
              '<%= options.folder.assets %>/css/frontend.css',
              '<%= options.folder.assets %>/css/backend.css'
            ]
        }
      },

      // grunt-shell executes shell commands
      shell: {
        link_current: {
            command: 'ln -s <%= options.folder.create %> current'
        },
        update_version: {
            command: 'echo <%= options.folder.create %> > version'
        },
        version: {
            command: 'echo ' + grunt.file.read('version')
        },
        composer_install: {
            command: [
                'cd <%= options.folder.create %>/src',
                'php -r \"readfile(\'https://getcomposer.org/installer\');" | php'
                ].join('&&')
        },
        composer_deps: {
            command: [
                'cd <%= options.folder.create %>/src',
                'php composer.phar install'
                ].join('&&')
        },
        npm: {
            command: [
                'cd <%= options.folder.current %>/src',
                'npm install'
                ].join('&&')
        },
        bower: {
            command: [
                'cd <%= options.folder.current %>/src',
                'node.exe node_modules/bower/bin/bower install'
                ].join('&&')
        }
      },
      // grunt-git: clones a git repository. pull/rebase/merge are also available
      gitclone: {
        clone: {
            options: {
                repository: '<%= options.url %>',
                branch: 'master',
                directory: '<%= options.folder.create %>'
            }
        }
      },
      // grunt-contrib-clean: deletes directories
      clean: {
        all: {
          src: '<%= options.clean.all %>'
        },
        setup: {
          src: 'current'
        }
      },
      // grunt-contrin-concat: concatenates js files
      concat: {
        options: {
          separator: ';',
        },
        js_frontend: {
          src: [
            '<%= options.folder.bower %>jquery/jquery.js',
            '<%= options.folder.bower %>bootstrap/dist/js/bootstrap.js',
            '<%= options.folder.assets %>/js/frontend.js'
          ],
          dest: '<%= options.folder.public %>/js/frontend.js',
        },
        js_backend: {
          src: [
            '<%= options.folder.bower %>jquery/jquery.js',
            '<%= options.folder.bower %>bootstrap/dist/js/bootstrap.js',
            '<%= options.folder.assets %>/js/backend.js'
          ],
          dest: '<%= options.folder.public %>/js/backend.js',
        },
      },
      // git-contrib-cssmin: concats and minifies css files
      cssmin: {
        combine: {
          files: {
            '<%= options.folder.public %>/css/frontend.css': [
            '<%= options.folder.assets %>/css/frontend.css'
            ],
            '<%= options.folder.public %>/css/backend.css': [
             '<%= options.folder.assets %>/css/backend.css'
            ]
          }
        }
      },
      // git-contrib-less: parses less files and compiles them to css
      less: {
        development: {
          options: {
            compress: true,  //minifying the result
          },
          files: {
            //compiling frontend.less into frontend.css
            "<%= options.folder.assets %>/css/frontend.css":"<%= options.folder.assets %>/css/frontend.less",
            //compiling backend.less into backend.css
            "<%= options.folder.assets %>/css/backend.css":"<%= options.folder.assets %>/css/backend.less"
          }
        }
      },
      // grunt-contrib-uglify: minifies js files
      uglify: {
        options: {
          mangle: true,  // Use if you want the names of your functions and variables unchanged
          compress: true,
          beautify: false
        },
        frontend: {
          files: {
            '<%= options.folder.public %>/js/frontend.js': '<%= options.folder.public %>/js/frontend.js',
          }
        },
        backend: {
          files: {
            '<%= options.folder.public %>/js/backend.js': '<%= options.folder.public %>/js/backend.js',
          }
        },
      },
      phpunit: {
        //...
      },
      watch: {
        js_frontend: {
          files: [
            //watched files
            '<%= options.folder.bower %>jquery/jquery.js',
            '<%= options.folder.bower %>bootstrap/dist/js/bootstrap.js',
            '<%= options.folder.assets %>/javascript/frontend.js'
            ],
          tasks: ['concat:js_frontend','uglify:frontend'],     //tasks to run
          options: {
            livereload: true                        //reloads the browser
          }
        },
        js_backend: {
          files: [
            //watched files
            '<%= options.folder.bower %>jquery/jquery.js',
            '<%= options.folder.bower %>bootstrap/dist/js/bootstrap.js',
            '<%= options.folder.assets %>/javascript/backend.js'
          ],
          tasks: ['concat:js_backend','uglify:backend'],     //tasks to run
          options: {
            livereload: true                        //reloads the browser
          }
        },
        less: {
          files: ['<%= options.folder.assets %>/stylesheets/*.less'],  //watched files
          tasks: ['less'],                          //tasks to run
          options: {
            livereload: true                        //reloads the browser
          }
        }
        // tests: {
        //   files: ['app/controllers/*.php','app/models/*.php'],  //the task will run only when you save files in this location
        //   tasks: ['phpunit']
        // }
      }
    });
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'less', 'cssmin']);
    grunt.registerTask('clone', ['gitclone:clone', 'shell:update_version', 'clean:setup', 'shell:link_current']);
    grunt.registerTask('setup', ['clone', 'shell:composer_install', 'shell:composer_deps', 'shell:npm', 'shell:bower']);
}