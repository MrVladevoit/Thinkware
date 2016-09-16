'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	include = require('gulp-file-include'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	debug = require('gulp-debug'),
	multipipe = require('multipipe');

module.exports = function(options) {

	return function() {
		return multipipe (
			gulp.src(options.src),
			$.plumber({
				errorHandler: notify.onError(function(err){
					return{
						title: 'html:include',
						massage:err.massage
					};
				})
			}),
			include({
				prefix: '@@',
				basepath: '@file'
			}),
			$.debug({title:'html:include'}),
			gulp.dest(options.dest)
		);
	};

};