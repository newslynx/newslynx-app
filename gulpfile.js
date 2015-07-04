var gulp = require('gulp');
var nib = require('nib');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
// var nodemon = require('gulp-nodemon');

var paths = {
  css: {
    main: './lib/public/stylesheets/*.styl',
    all: [
      './lib/public/stylesheets/**/*.styl',
      './lib/public/stylesheets/*.styl'
    ]
  },
  js: [
    './lib/public/javascripts/namespace.js',
    './lib/public/javascripts/helpers/*.js',
    './lib/public/javascripts/models/*.js',
    './lib/public/javascripts/collections/*.js',
    './lib/public/javascripts/app/*.js',
    './lib/public/javascripts/views/*.js',
    './lib/public/javascripts/routing/*.js',
    './lib/public/javascripts/init.js'
  ]
};

gulp.task('compile-stylus', function() {
  gulp.src(paths.css.main)
    .pipe(plumber())
    .pipe(stylus({
      use: nib()
    }))
    .pipe(gulp.dest('lib/public/stylesheets/css/'));
});

gulp.task('compile-js', function() {
  return gulp.src(paths.js)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.bundled.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./lib/public/javascripts/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.css.all, ['compile-stylus'])
  gulp.watch(paths.js, ['compile-js']);
});

// gulp.task('demon', function () {
//   nodemon({
//     script: './bin/www',
//     ext: 'jade json'
//   })
//     .on('start', ['default', 'watch'])
//     .on('change', ['watch'])
//     .on('restart', function () {
//       console.log('restarted!');
//     });
// });

gulp.task('default', ['compile-stylus', 'compile-js']); // Simply compile
gulp.task('watch-files',   ['watch', 'compile-stylus', 'compile-js']); // Watch files for changes
// gulp.task('dev', ['demon']);