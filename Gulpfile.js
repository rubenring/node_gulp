/// <vs Clean='cleanScripts' />
(function () {

    /*Included modules*/
    var gulp = require('gulp');
    var gutil = require('gulp-util');
    var uglify = require('gulp-uglify');
    var gulpSequence = require('gulp-sequence')
    var pump = require('pump');
    var rename = require('gulp-rename');
    var rimraf = require('gulp-rimraf');
    var sourcemaps = require('gulp-sourcemaps');
    var concat = require('gulp-concat');
    var webserver = require('gulp-webserver');
    var eslint = require('gulp-eslint');
    var sass = require('gulp-sass');

    /*Paths*/
    var dist = {
      base: "./dist",
      js: "./dist/js",
      min: "./dist/js/min",
      moarjs: "./dist/moarjs",
      css: "./dist/css"
    }
    var src = {
      js: "./src/js",
      moarjs: "./src/moreJs",
      sass: "./src/scss"
    }

    /*Gulp tasks*/
    gulp.task('clean', (cb) => {
      gutil.log(gutil.colors.red("Cleaning dist"))
      pump([
        gulp.src(dist.base),
        rimraf()
      ], cb)
    })

    gulp.task('webserver', function(cb) {
      gutil.log(gutil.colors.green("Starting webserver"))
      pump([
        gulp.src('./'),
        webserver({
          livereload: true,
          directoryListing: false,
          open: false,
          port: 8100
        })
      ], cb)
    });
    gulp.task('lint', () => {
      gutil.log(gutil.colors.blue("Running lint"))

        return gulp.src(['./src/**/*.js','!node_modules/**'])
            .pipe(eslint())
            .pipe(eslint.format())
            // To have the process exit with an error code (1) on
            // lint error, return the stream and pipe to failAfterError last.
            //.pipe(eslint.failAfterError());
    });
    gulp.task('buildjs', (cb) => {
      var uglifyOptions = {
        preserveComments: 'license'
      }
      gutil.log(gutil.colors.blue("Building JavaScript"))
      pump([
        gulp.src([src.js + "/**/*.js", src.moarjs + "/**/testme.js"]),
        sourcemaps.init(),
        concat('all.js'),
        gulp.dest(dist.js),
        uglify(),
        rename('main.min.js'),
        sourcemaps.write('./'),
        gulp.dest(dist.min)
      ], cb)
    });

    gulp.task('sass', function (cb) {
      gutil.log(gutil.colors.blue("Building styles"))
      pump([
        gulp.src(src.sass + '/base.scss'),
        sourcemaps.init(),
        sass({outputStyle: 'compressed'}).on('error', sass.logError),
        rename('main.min.css'),
        sourcemaps.write(),
        gulp.dest(dist.css),
      ], cb)
    });

    gulp.task('build', gulpSequence('clean', ['buildjs', 'sass'], 'webserver', 'lint', 'watch'));

    gulp.task('watch', () => {
      gulp.watch([src.js + "/**/*.js", src.moarjs + "/**/*.js"], ['lint', 'buildjs']);
      gulp.watch(src.sass + "/**/*.scss", ['sass']);
    })
      /*Default*/
    gulp.task('default', ['build']);
})()
