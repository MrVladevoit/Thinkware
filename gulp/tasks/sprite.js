'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	gulpIf = require('gulp-if'),
	multipipe = require('multipipe');

module.exports = function(options) {//options.src||options.dest

	return function() {
		return multipipe (
			gulp.src(options.src),
			$.newer('dest/images/icons/'),
			$.remember('sprite'),
			$.spritesmith({
				imgName: 'sprite.png',
				cssName: 'sprite.less',
				imgPath:'../images/sprite/sprite.png'
			}),
			gulpIf('*.png', gulp.dest('dest/images/icons'), gulp.dest('src/less'))
		);
	};

};