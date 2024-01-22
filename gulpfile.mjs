import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import htmlmin from 'gulp-htmlmin';
import htmlclean from 'gulp-htmlclean';
import imagemin from 'gulp-imagemin';

gulp.task('minify-css', function () {
  return gulp.src('./public/**/*.css')
    .pipe(cleanCSS())
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
    .pipe(gulp.dest('./public'));
});

gulp.task('minify-js', function () {
  return gulp.src(['./public/**/*.js', '!./public/js/**/*min.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./public'));
});

gulp.task('minify-images', function () {
  return gulp.src('./public/images/**/*.*')
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: false,
      multipass: false,
    }))
    .pipe(gulp.dest('./public/images'));
});

gulp.task('default', gulp.parallel('minify-html', 'minify-css', 'minify-js', 'minify-images'));
