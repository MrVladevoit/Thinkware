'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	include = require('gulp-file-include'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	debug = require('gulp-debug'),
	multipipe = require('multipipe');

module.exports = function(options) {

	return function() {
		return multipipe (
			gulp.src(options.src),
			imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()]
			}),
			$.debug({title:'image:min'}),
			gulp.dest(options.dest)
		);
	};

};