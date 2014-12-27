var gulp = require('gulp');
var run = require('gulp-run');

var pegjs_cmd = './node_modules/.bin/pegjs';
var browserify_cmd = './node_modules/.bin/browserify';

gulp.task('generate-parser', function() {
    gulp.src('src/WeberLogic.js')
        .pipe(run(pegjs_cmd))
        .pipe(gulp.dest('build'));
    run(browserify_cmd + ' -r ./build/WeberLogic.js:WeberLogic -o dist/WeberLogic.js').exec();
});


