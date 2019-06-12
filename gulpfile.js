var syntax        = 'sass', // Syntax: sass or scss;
		gulpversion   = '3'; // Gulp version: 3 or 4


var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require('gulp-notify'),
		svgSprite     = require('gulp-svg-sprite'),
		cheerio 			= require('gulp-cheerio');
		babel 				= require('gulp-babel');

/* === Local server === */
gulp.task('browser-sync', function() {
	browserSync({
    // proxy: 'app', // if proxy
    server: {
      baseDir: 'app'
    },
		notify: false,
		open: false
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

/* === Sass compail === */
gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	// .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

/* === Build libs === */
gulp.task('libs-js', function() {
	return gulp.src([
		// 'app/libs/jquery/dist/jquery.min.js',
		])
	.pipe(concat('_libs.min.js'))
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

/* === Build component === */
gulp.task('scripts', function() {
	return gulp.src('app/js/component-js/*.js')
	 // Compile es6 code 
	.pipe(concat('common.js'))
	.pipe(babel({presets: ['@babel/env']}))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

/* === Svg sprite === */
gulp.task('svg-sprite', function(){
	return gulp.src('app/img/svg-separate/*.svg')
	.pipe(cheerio({
		run: function($) {
			$('[fill]').removeAttr('fill');
			$('[style]').removeAttr('fill');
		}
	}))
	.pipe(svgSprite({
		mode: {
			symbol: {
				dest: ".",
				sprite: "sprite.svg"
			}
		}
	}))
	.pipe(gulp.dest('app/img'))
});


if (gulpversion == 3) {
	gulp.task('watch', ['styles', 'scripts', 'browser-sync'], function() {
		gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
		gulp.watch(['libs/**/*.js', 'app/js/component-js/*.js'], ['scripts']);
		gulp.watch('app/*.html', ['code'])
	});
	gulp.task('default', ['watch']);
}

if (gulpversion == 4) {
	gulp.task('watch', function() {
		gulp.watch('app/'+syntax+'/**/*.'+syntax+'', gulp.parallel('styles'));
		gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
		gulp.watch('app/*.html', gulp.parallel('code'))
	});
	gulp.task('default', gulp.parallel('watch', 'styles', 'scripts', 'browser-sync'));
}


