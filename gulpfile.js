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
  hexrgba = require('postcss-hexrgba'),
  del = require('del'),
  htmlMin = require('gulp-htmlmin'),
  cleanCSS = require('gulp-clean-css'),
  imagemin = require('gulp-imagemin'),
  htmlReplace = require('gulp-html-replace');

//   css
function style() {
  return gulp
    .src('./src/assets/css/*.css')
    .pipe(postcss([cssImport, mixins, cssvars, nested, hexrgba, autoprefixer]))
    .pipe(gulp.dest('./src/temp/css'))
    .pipe(browserSync.stream());
}

//  script
function script(cb) {
  return gulp
    .src('./src/assets/js/script.js')
    .pipe(
      webpackStream(
        {
          output: {
            filename: 'main.js'
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
            ]
          },
          mode: 'development'
        },
        webpack
      )
    )
    .pipe(gulp.dest('./src/temp/js'))
    .pipe(browserSync.stream());

  cb();
}

/////////////////////////////
// Watch and serve
////////////////////////////
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

////////////////////////////////////
// dist
///////////////////////////////////
// Change 'dist' or 'docs'
const path = 'dist';

// delete dist folder
function deleteFolder() {
  return del(['./dist', './docs']);
}

// copy HTML , replace css,js link & minify
function minifyHTML(cb) {
  gulp
    .src('./src/*.html')
    .pipe(
      htmlReplace({
        css: './assets/css/style.css',
        js: './assets/js/main.js'
      })
    )
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(gulp.dest(`./${path}`));

  cb();
}

// copy css & minify
function minifyCSS(cb) {
  gulp
    .src('./src/temp/css/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(`./${path}/assets/css`));

  cb();
}

// copy javascript
// Set 'mode' option to 'development' or 'production' in webpack config
// 'production' will minify
function copyJavaScript(cb) {
  gulp.src('./src/temp/js/*').pipe(gulp.dest(`./${path}/assets/js`));
  cb();
}

// copy img and compress
function compressImg(cb) {
  gulp
    .src('./src/assets/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest(`./${path}/assets/img`));

  cb();
}

exports.watch = watch;
exports.dist = gulp.series(
  deleteFolder,
  minifyHTML,
  minifyCSS,
  copyJavaScript,
  compressImg
);
