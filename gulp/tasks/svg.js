'use strict';

var gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$ = gulpLoadPlugins(),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	gulpIf = require('gulp-if'),
	notify = require('gulp-notify'),
	multipipe = require('multipipe');


module.exports = function(options) {//options.src||options.dest

	return function() {
		return multipipe (
			$.newer('dest/images/sprite/'),
			gulp.src(options.src),
			// cached('svg'),
			$.remember('svg'),
			// minify svg
			svgmin({
				js2svg: {
					pretty: true
				}
			}),
			// remove all fill, style and stroke declarations in out shapes
			cheerio({
				run: function ($) {
					$('[fill]').removeAttr('fill');
					$('[stroke]').removeAttr('stroke');
					$('[style]').removeAttr('style');
				},
				parserOptions: {xmlMode: true}
			}),
			$.svgSprite({
				mode: {
					symbol: {
						sprite: "../sprite.svg",
						render: {
							scss: {
								dest:"../_sprite.scss",
								template: "src/sass/templates/_sprite_template.scss"
							}
						}
					},
					css: {
						bust:false,
						sprite: "../sprite-position.svg",
						layout:     'vertical',
						prefix:     '.svg-',
						dimensions: true,
						render:     {
							scss: {
								dest:"../_sprite-position.scss",
							}
						}
					}
				}
			}),
			$.debug({title:'svg'}),
			gulpIf('*.scss', gulp.dest('./src/sass/sprite'),gulp.dest('./build/images/sprite')
			),
			notify("SVG SPRITE DONE!")
		);
	};

};