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
    watch: {
      sass: {
        files: ['**/*.scss'],
        tasks: ['sass', 'postcss']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('build', ['sass', 'postcss']);
};
