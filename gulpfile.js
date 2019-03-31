const gulp = require('gulp'),
  postcss = require('gulp-postcss'),
  cssvars = require('postcss-simple-vars'),
  nested = require('postcss-nested'),
  autoprefixer = require('autoprefixer'),
  cssImport = require('postcss-import'),
  browserSync = require('browser-sync').create(),
  webpack = require('webpack'),
  webpackStream = require('webpack-stream'),
  mixins = require('postcss-mixins'),
  hexrgba = require('postcss-hexrgba');

//   css
function style() {
  return gulp
    .src('./src/assets/css/*.css')
    .pipe(postcss([cssImport, mixins, cssvars, nested, hexrgba, autoprefixer]))
    .pipe(gulp.dest('./src/temp/css'))
    .pipe(browserSync.stream());
}

//  script
function script(callback) {
  return gulp
    .src('./src/assets/js/script.js')
    .pipe(
      webpackStream(
        {
          output: {
            filename: 'main.js'
          },
          mode: 'development'
        },
        webpack
      )
    )
    .pipe(gulp.dest('./src/temp/js'))
    .pipe(browserSync.stream());

  callback();
}

// Watch and serve
function watch() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: './src'
    }
  });
  gulp.watch('./src/assets/css/**/*.css', style);
  gulp.watch('./src/assets/js/**/*.js', script);
  gulp.watch('./src/*.html').on('change', browserSync.reload);
}

exports.watch = watch;
