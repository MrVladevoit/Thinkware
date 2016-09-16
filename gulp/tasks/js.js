'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	//HTML
	include = require('gulp-file-include'),
	notify = require('gulp-notify'),
	multipipe = require('multipipe');

module.exports = function(options) {//options.src||options.dest

	return function() {
		return multipipe (
			gulp.src(options.src),
			$.plumber({
				errorHandler: notify.onError(function(err){
					return{
						title: 'js:include',
						massage:err.massage
					};
				})
			}),
			include({
			  prefix: '@@',
			  basepath: '@file'
			}),
			$.debug({title:'js:include'}),
			gulp.dest(options.dest),
			$.uglify(),
			$.rename({
				extname: '.min.js'
			}),
			gulp.dest(options.minDest),
			notify("JS DONE!")
		);
	};

};