var gulp = require('gulp');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();

var defaultAssets = {
  app:{
    sass:[
      './app/styles/*.scss',
      './app/**/styles/*.scss'
    ],
    views:[
      './app/**/views/*.html'
    ],
    ts:[
      './app/*.ts',
      './app/**/*.ts'
    ]
  }
};

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('./index.html').on('change', browserSync.reload);
    gulp.watch(defaultAssets.app.sass, ['sass']);
    gulp.watch(defaultAssets.app.views).on('change', browserSync.reload);
    gulp.watch(defaultAssets.app.ts, ['tsc']).on('change', browserSync.reload);
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

gulp.task('sass', function () {
  gulp.src(defaultAssets.app.sass)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public'));
});

gulp.task('html', function() {
  return gulp.src(defaultAssets.app.views)
    .pipe(gulp.dest('./public'))
});

// Typescript task
gulp.task('tsc', function () {
  var tsProject = ts.createProject('tsconfig.json');
  var tsResult = tsProject.src() // instead of gulp.src(...)
  .pipe(ts(tsProject));

  return tsResult.js
  .pipe(rename(function (path) {
    path.dirname = path.dirname.replace('app', '');
  }))
  .pipe(gulp.dest('public'));
});

// Lint CSS and JavaScript files.
gulp.task('lint', function(done) {
	runSequence('sass', 'html', 'tsc', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'lint', ['browser-sync'], done);
});
