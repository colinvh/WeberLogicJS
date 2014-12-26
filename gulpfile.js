var gulp = require('gulp');
var run = require('gulp-run');

var pegjs_cmd = './node_modules/.bin/pegjs';

gulp.task('generate-parser', function() {
    run('mkdir lib').exec();
    run(pegjs_cmd + ' src/parser.pegjs lib/WeberLogicJS.js').exec();
});
