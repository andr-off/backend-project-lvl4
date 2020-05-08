import gulp from 'gulp';
import getServer from '.';

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 4000, cb);
});

