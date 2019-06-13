var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var imagemin = require('gulp-imagemin');

gulp.task('minify-css', function () {
  return gulp.src('./public/**/*.css')
    .pipe(minifycss())
    .pipe(gulp.dest('./public'));
});

gulp.task('minify-html', function () {
  return gulp.src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(htmlmin({
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    }))
    .pipe(gulp.dest('./public'))
});

gulp.task('minify-js', function () {
  return gulp.src(['./public/**/*.js', '!./public/js/**/*min.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./public'));
});

gulp.task('minify-images', function () {
  return gulp.src('./public/images/**/*.*')
    .pipe(imagemin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: false, //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('./public/images'));
});

gulp.task('default', gulp.parallel('minify-html', 'minify-css', 'minify-js', 'minify-images'));