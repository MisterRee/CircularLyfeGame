// install devDependencies prior to running
var gulp = require( 'gulp' ),
    notify = require( 'gulp-notify' ),
    rename = require( 'gulp-rename' ),
    uglify = require( 'gulp-uglify' ),

    babel = require( 'babelify' ),
    browserify = require( 'browserify' ),
    del = require( 'del' ),
    buffer = require( 'vinyl-buffer' ),
    source = require( 'vinyl-source-stream' ),

    runSequence = require( 'run-sequence' );

// deletes the old compiled file if it exists, for security's sake
gulp.task( 'clean', function(){
  return del( './bundle.min.js' );
});

// compiling script
gulp.task( 'build', function(){
  return browserify( './js/main.js' )
    .transform( "babelify", { presets: ["env"] } )
    .bundle()
    .pipe( source( 'main.js' ) )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename( 'bundle.min.js' ) )
    .pipe( gulp.dest( './' ) )
});

// Sequencially runs gulp tasks
gulp.task( 'reboot', function( done ){
  runSequence( 'clean', 'build', function(){
    done();
  });
});

// Runs tests on any file changes in development folders
gulp.task( 'watch', function(){
  gulp.watch( ['./js/**'], ['reboot'] );
});

gulp.task( 'default', ['watch'] );
