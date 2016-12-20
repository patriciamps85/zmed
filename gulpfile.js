// Include gulp
var gulp     = require('gulp');

// Include Our Plugins
var jshint       = require('gulp-jshint');
var sass         = require('gulp-sass');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var rename       = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var imagemin     = require('gulp-imagemin');
var rimraf       = require('gulp-rimraf');
var plumber      = require('gulp-plumber');
var changed      = require('gulp-changed');
var notify       = require("gulp-notify");

var watchify     = require('watchify');


// config vars
var config = {
    sass: {
        source: 'assets/sass/*.scss',
        dest: "dist/css"
    },
    jsMin: {
        source: (['assets/js/bootstrap/*.js', 'assets/js/*.js']),
        outFilename: "all.min.js",
        outFolderPath: "dist/js"
    },
    imgs: {
        source: "assets/images/**/*.*",
        dest: "dist/images"
    },
    fonts: {
        source: "assets/fonts/**/*.{otf,eot,svg,ttf,woff}",
        dest: "dist/fonts"
    }
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(['assets/js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src(config.sass.source)
        .pipe(
            sass({outputStyle: 'compressed'}),
            sass({outputStyle: 'expanded'})) // nested, expanded, compact, compressed
        .pipe(autoprefixer({ remove: false, browsers: ['last 2 version', 'ie 8', 'ie 9']}))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.sass.dest));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(config.jsMin.source)
        .pipe(concat('all.js'))
        .pipe(rename(config.jsMin.outFilename))
        .pipe(uglify())
        .pipe(gulp.dest(config.jsMin.outFolderPath));
});

/**
 * Copy imgs to dist and compress them
 * Copy fonts to dist
 */
gulp.task('copyAssets', function() {
    Object.keys(config).forEach(function(k){
        switch (k){
            case 'imgs':
                // remove assets
                gulp.src(config[k].dest+"/**/*.*", {read: false})
                    .pipe(rimraf({ force: true }));
                // add images and compress
                gulp.src(config[k].source)
                    .pipe(plumber({
                        errorHandler: function(error){
                            console.log(error);
                        }
                    }))
                    .pipe(changed(config[k].dest))
                    .pipe(imagemin())
                    .pipe(gulp.dest(config[k].dest));
                break;
            case 'fonts':
                // remove files
                gulp.src(config[k].dest+"/**/*.*", {read: false})
                    .pipe(rimraf({ force: true }));
                // add fonts
                gulp.src(config[k].source)
                        .pipe(gulp.dest(config[k].dest));
                break;
        }
    });
});


// Default Task
gulp.task('default', ['sass', 'copyAssets', 'lint', 'scripts']);

// Watch Task
gulp.task('watch', ['sass', 'copyAssets', 'lint', 'scripts'], function(){
        console.log("-> Start watching for changes...");
        gulp.watch(config.sass.source, ['sass']);
        gulp.watch(config.jsMin.source[0], ['lint', 'scripts']);
});

gulp.task('watch_sass', function () {
    // Watch sass files
    gulp.watch('assets/sass/**/*.scss', ['sass']);
    gulp.watch('assets/sass/style.scss', ['sass']);

});