'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	notify = require('gulp-notify'),
	multipipe = require('multipipe');

module.exports = function(options) {//options.src||options.dest

	return function() {
		return multipipe (
			gulp.src(options.src),
			$.uglify(),
			$.rename({
				extname: '.min.js'
			}),
			$.debug({title:'js:minify'}),
			gulp.dest(options.dest)
		);
	};

};