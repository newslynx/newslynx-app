var gulp = require('gulp');

var plumber = require('gulp-plumber');
var uglify = require('gulp-uglifyjs');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var stylus = require('gulp-stylus');
var nib = require('nib');

// Handle an error based on its severity level.
// Log all levels, and exit the process for fatal levels.
function handleError(level, error) {
	gutil.log(error.message);
}
 
// Convenience handler for error-level errors.
function onError(error) { handleError.call(this, 'error', error); this.end();}

var paths = {
	js: 		[
					'lib/public/javascripts/namespace.js',
					'lib/public/javascripts/helpers/*.js',
					'lib/public/javascripts/models/*.js',
					'lib/public/javascripts/collections/*.js',
					'lib/public/javascripts/app/*.js',
					'lib/public/javascripts/views/*.js',
					'lib/public/javascripts/routing/*.js',
					'lib/public/javascripts/init.js'
					],
	css:    ['lib/public/stylesheets/*.styl'],
	jade:   [
					'lib/public/views/*.jade',
					'lib/public/views/page-divisions/content/*.jade',
					'lib/public/views/page-divisions/drawer/*.jade',
					'lib/public/views/page-divisions/left-rail/*.jade'
					]
};

// gulp.task('server', function() {
// 	nodemon({ script: 'bin/www' });
// });

gulp.task('lintjs', function() {
	return gulp.src(paths.js)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		on('error', onError);
});

gulp.task('uglify', function() {
	return gulp.src(paths.js)
		.pipe(uglify('main.bundled.js', {
			// outSourceMap: true
			mangle: false,
			output: {
				beautify: true
			}
		}))
		.pipe(gulp.dest('lib/public/javascripts'))
		on('error', onError);

});	

gulp.task('nib', function () {
	gulp.src(paths.css)
		.pipe(stylus({use: [nib()]}))
		.pipe(gulp.dest('lib/public/stylesheets'))
		on('error', onError);

});

gulp.task('watch', function() {
	gulp.watch(paths.css, ['nib']);
	gulp.watch(paths.js, ['uglify']);
});

gulp.task('demon', function () {
	nodemon({
		script: 'bin/www',
		ext: 'js jade styl json',
		ignore: ["main.bundled.js"]
  })
	.on('start', ['watch'])
	.on('restart', function () {
		console.log('Gulp restarted!');
	});
});

gulp.task('default', ['demon']);
// gulp.task('default', ['server',  'watch']);
