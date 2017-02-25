var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload');

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'Html task complete' }));
});

gulp.task('scripts', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('default', function() {
    gulp.start('scripts', 'html');
});

gulp.task('watch', function() {
    gulp.watch('src/js/*.js', ['scripts']);
    livereload.listen();
    gulp.watch(['dist/**']).on('change', livereload.changed);
});