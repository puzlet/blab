module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
          'build/blabr-main.js': ['src/blabr.coffee'],
          'build/guide.js': ['src/guide.coffee'],
          'build/utils.js': ['src/utils.coffee'],
          'build/demo-runner.js': ['src/demo-runner.coffee'],
          'js/widgets.js': [
              'widgets/input/component.coffee',
              'widgets/input/widget.coffee',
              'widgets/menu/component.coffee',
              'widgets/menu/widget.coffee',
              'widgets/slider/component.coffee',
              'widgets/slider/widget.coffee',
              'widgets/plot/component.coffee',
              'widgets/plot/widget.coffee',
              'widgets/table/component.coffee',
              'widgets/table/widget.coffee',
              'src/widgets.coffee'
          ],
          // 'js/widgets.js': ['src/widgets.coffee'],
          'js/lecture.js': ['src/lecture.coffee']
        }
      }
    },
    concat: {
      options: {
        separator: ''  // ';'
      },
      dist: {
        src: ['build/**/*.js'],
        dest: 'js/<%= pkg.name %>.js'
      },
      css: {
        options: {
          banner: '/* Auto-generated from widgets style.css files */\n\n'
        },
        src: [
          'widgets/input/style.css',
          'widgets/menu/style.css',
          'widgets/slider/style.css',
          'widgets/plot/style.css',
          'widgets/table/style.css'
        ],
        dest: 'css/widgets.css'
      }
    },
    // uglify: {
    //   options: {
    //     banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    //   },
    //   build: {
    //     src: 'js/<%= pkg.name %>.js',
    //     dest: 'js/<%= pkg.name %>.min.js'
    //   }
    // },
    watch: {
      files: ['src/*.coffee', 'widgets/*/*.coffee', 'widgets/*/*.css'],
      tasks: ['coffee', 'concat']
//      tasks: ['coffee', 'concat', 'uglify']
    }
  });
  
  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  // Default task(s).
  grunt.registerTask('default', ['coffee', 'concat']);
  //grunt.registerTask('default', ['coffee', 'concat', 'uglify']);
};