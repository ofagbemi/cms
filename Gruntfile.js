'use strict';

module.exports = (grunt) => {

  grunt.initConfig({
    sass: {
      dist: {
        files: { 'res/css/main.css': 'sass/main.scss' }
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          require('pixrem')(),
          require('autoprefixer'),
          require('cssnano')()
        ]
      },
      dist: {
        src: 'res/css/main.css'
      }
    },
    browserify: {
      options: {
        transform: [['babelify', { presets: ['es2015'] }]]
      },
      dist: {
        files: {
          'res/js/main.js': 'client/main.js'
        }
      }
    },
    watch: {
      sass: {
        files: ['**/*.scss'],
        tasks: ['sass', 'postcss']
      },
      scripts: {
        files: ['client/*.js', 'components/**/*.js', 'views/**/*.js'],
        tasks: ['browserify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('build', ['sass', 'postcss', 'browserify']);
};
