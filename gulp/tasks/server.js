'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	browserSync = require('browser-sync').create();

module.exports = function(options) {
	return function() {
		browserSync.init({
			server: "./build",
			port: 3000
		});
		browserSync.watch("build/images/**/*.*").on("change", browserSync.reload);
		browserSync.watch("build/js/*.js").on("change", browserSync.reload);
		browserSync.watch("build/css/*.css", function (event, file) {
			if (event === "change") {
				browserSync.reload("*.css");
			}
		});
		gulp.watch("build/*.html").on('change', browserSync.reload);
	};
};