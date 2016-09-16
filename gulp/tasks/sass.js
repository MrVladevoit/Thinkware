'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	// СТИЛИ
	cleanCSS = require('gulp-clean-css'),
	mmq = require('gulp-merge-media-queries'),
	notify = require('gulp-notify'),
	assets  = require('postcss-assets'),
	multipipe = require('multipipe');

module.exports = function(options) {//options.src||options.dest

	return function() {
		return multipipe (
			gulp.src(options.src),//берем сам main.less
			$.debug({title:'src'}),
			$.plumber({
				errorHandler: notify.onError(function(err){
					return{
						title: 'Sass ERROR!!!',
						massage:err.massage
					};
				})
			}),
			$.sass(),
			$.autoprefixer('last 3 versions'),
			$.postcss([assets({
				loadPaths: ['build/images'],
				relative: 'build/css'
			})]),
			$.csscomb(),
			mmq(),
			gulp.dest(options.dest),//сохраняем все в dest
			$.debug({title:'dest'}),

			cleanCSS(),//минификация css файла
			$.rename({
				extname: '.min.css'
			}),//переименовываем
			gulp.dest(options.dest),
			$.debug({title:'mincss'})
		).on('error', notify.onError());//если ошибка произошла
	};

};