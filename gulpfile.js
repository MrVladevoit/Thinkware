'use strict';

// ////////////////////////////////////////////////
//
// GULP СБОРКА ДЛЯ ВЕРСТКИ САЙТОВ
//
// // /////////////////////////////////////////////

/*----------------------------------------
	PLUGINS
----------------------------------------*/

var gulp = require('gulp'),
	// РАБОТАЕМ С ПРОИЗВОДИТЕЛЬНОСТЬЮ СБОРКИ
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	gulpIf = require('gulp-if'),
	spritesmith = require('gulp.spritesmith'),

	browserSync = require('browser-sync').create(),
	dirSync = require('gulp-directory-sync'),
	plumber = require('gulp-plumber'),
	purifycss = require('gulp-purifycss'),
	postcss = require('gulp-postcss'),
	replace = require('gulp-replace'),
	runSequence = require('run-sequence');

/*----------------------------------------
	PATHS
----------------------------------------*/
var paths = require('./gulp/paths');
console.log($);

// ПОДКЛЮЧАЕМ ОТДЕЛЬНО TASKS
function lazyRequireTask(taskName, path, options) {
  options = options || {};
  options.taskName = taskName;
  gulp.task(taskName, function(callback) {
	var task = require(path).call(this, options);

	return task(callback);
  });
}

/*----------------------------------------
	ZIP FILES
----------------------------------------*/
lazyRequireTask('zip', './gulp/tasks/zip', {
	src: paths.allDev,
	dest: paths.tempDir
});

/*----------------------------------------
	FTP
----------------------------------------*/
lazyRequireTask('ftp', './gulp/tasks/ftp', {
  src: paths.allDev
});

/*----------------------------------------
	HTML
----------------------------------------*/

lazyRequireTask('html', './gulp/tasks/html', {
	src: paths.html.src,
	dest: paths.html.dest
});

/*----------------------------------------
	STYLES
----------------------------------------*/
//sass
lazyRequireTask('sass', './gulp/tasks/sass', {
	src: paths.sass.app,
	dest: paths.sass.dest
});

/*----------------------------------------
	JS
----------------------------------------*/

lazyRequireTask('js', './gulp/tasks/js', {
	src: paths.js.app,
	dest: paths.js.dest,
	minDest: paths.js.dest
});

//minify js files
lazyRequireTask('js:min', './gulp/tasks/minjs', {
	src: paths.js.minSrc,
	dest: paths.js.minDest
});

//JS:concat
// lazyRequireTask('concat', './gulp/concat', {
// 	name: 'name.js',
// 	src: paths.js.src,
// 	dest: paths.js.dest,
// 	destMin: paths.js.dest
// });


/*----------------------------------------
	SVG
----------------------------------------*/

//SVG SPRITE
lazyRequireTask('svg', './gulp/tasks/svg', {
  src: paths.svg.src,
});

//SVG SPRITE BASE 64
lazyRequireTask('svg:base', './gulp/tasks/svgBase', {
	src: paths.svg.src,
	dest: paths.svg.base64
});

/*----------------------------------------
	SPRITE PNG FILES
----------------------------------------*/
gulp.task('sprite', function () {
	var spriteData = gulp.src('src/images/sprite/*')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			// retinaImgName: 'sprite@2x.png',
			cssName: '_sprite-png.scss',
			imgPath:'../images/sprite/sprite.png',
			padding: 15
		})
	);

var imgStream = spriteData.img
	.pipe(gulp.dest('build/images/sprite'));

var cssStream = spriteData.css
	.pipe(gulp.dest('src/sass/sprite/'));

});

/*----------------------------------------
	Synchronization
----------------------------------------*/
// gulp.task('imageSync', function () {
// 	return gulp.src('')
// 		.pipe(plumber())
// 		.pipe(dirSync('build/images/', 'src/images/', {printSummary: true}))
// 		.pipe(browserSync.stream());
// });

gulp.task('jsMinSync', function () {
	return gulp.src('src/js/minifier/**/*.js')
		.pipe(plumber())
		.pipe(gulp.dest('build/js/'))
		.pipe(browserSync.stream());
});

/*----------------------------------------
	MINIFY IMAGES
----------------------------------------*/

lazyRequireTask('images:min', './gulp/tasks/images', {
  src: paths.images.src,
	dest: paths.images.dest
});

//server
lazyRequireTask('server', './gulp/tasks/server', {});

//watching files and run tasks
gulp.task('watch', function () {
	// html
	$.watch(paths.html.all, function () {
		gulp.start('html');
	});
	// sass
	$.watch('src/sass/**/*', function () {
		gulp.start('sass');
	});
	// js
	$.watch(paths.js.all, function () {
		gulp.start('js');
	});
	$.watch(paths.js.minSrc, function () {
		gulp.start('jsMinSync');
		gulp.start('js:min');
	});
	// images
	// $.watch(paths.images.all, function () {
	// 	gulp.start('imageSync');
	// });
	$.watch(paths.images.src, function () {
		gulp.start('images:min');
	});
	// svg
	gulp.watch('src/svg/*.svg', ['svg']).on('change', function(event){
		if (event.type === 'deleted') {
			$.remember.forget('svg', event.path);
		}
	});
	$.watch(paths.svg.src, function () {
		gulp.start('svg:base');
	});
	// png
	$.watch('src/images/sprite/*.png', function () {
		gulp.start('sprite');
	});
});




gulp.task('default', ['html','sass','js','svg','watch','server']);


gulp.task('build', function() {
	return runSequence(
			['html', 'sass','js', 'js:min','svg','svg:base','images:min', 'sprite'],
			['zip'],
			['watch']
		);
});