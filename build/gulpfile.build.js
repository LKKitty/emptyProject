const gulp = require('gulp');
const stylus = require('gulp-stylus');
const postcss = require('gulp-postcss');
const postcssrc = require('postcss-load-config'); // 加载 .postcssrc.js
const uglify = require('gulp-uglify'); // 压缩js
const connect = require('gulp-connect'); // websock更新文件刷新浏览器
const plumber = require('gulp-plumber'); // 避免出错task终止
const minimist = require('minimist'); // 用于命令行传参数
const gulpif = require('gulp-if'); // 用于命令行传参
const cleanCSS = require('gulp-clean-css'); // 缩小css文件
const changed = require('gulp-newer'); // 增量更新
const babel = require('gulp-babel');
const opn = require('opn'); // 开启浏览器
const del = require('del'); // 删除dist文件夹
const Config = require('./gulpfile.config');
const { getPort } = require('./utils');

// 命令行传参数
const knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};
const options = minimist(process.argv.slice(2), knownOptions);

// 删除dist目录
const clean = () => {
  return del(['dist']);
};
// 检查端口冲突
const checkPort = async () => {
  Config.connect.port = await getPort();
};

// 开启文件服务器
const openServer = async () => await connect.server(Config.connect);

// HTML文件
const htmls = () => {
  return gulp
    .src(Config.html.src)
    .pipe(changed(Config.html.dist))
    .pipe(plumber())
    .pipe(gulp.dest(Config.html.dist))
    .pipe(connect.reload());
};

// CSS文件
const styles = async () => {
  const config = await postcssrc();
  return gulp
    .src([Config.css.src, Config.css.avoid])
    .pipe(changed(Config.css.dist))
    .pipe(plumber())
    .pipe(stylus())
    .pipe(postcss(config.plugins, config.options))
    .pipe(gulpif(options.env === 'production', cleanCSS()))
    .pipe(gulp.dest(Config.css.dist))
    .pipe(connect.reload());
};

// 图片文件
const images = () => {
  return gulp
    .src(Config.images.src)
    .pipe(changed(Config.images.dist))
    .pipe(plumber())
    .pipe(gulp.dest(Config.images.dist))
    .pipe(connect.reload());
};

// JS文件
const scripts = () => {
  return gulp
    .src(Config.js.src)
    .pipe(changed(Config.js.dist))
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(gulp.dest(Config.js.dist))
    .pipe(connect.reload());
};

// 相关库js文件
const libs = () => {
  return gulp
    .src(Config.libs.src)
    .pipe(changed(Config.libs.dist))
    .pipe(plumber())
    .pipe(gulp.dest(Config.libs.dist))
    .pipe(connect.reload());
};

// 自动打开浏览器
const openBrowser = async () => {
  const { host, port } = Config.connect;
  const url = `http://${host}:${port}/pages`;
  opn(url);
};

const watchFiles = () => {
  gulp.watch(Config.html.src, htmls);
  gulp.watch(Config.css.src, styles);
  gulp.watch(Config.images.src, images);
  gulp.watch(Config.js.src, scripts);
  gulp.watch(Config.libs.src, libs);
};

// 任务分类 build task && dev task
const devBuild = gulp.series(
  clean,
  checkPort,
  gulp.parallel(openServer, htmls, styles, images, scripts, libs),
  openBrowser
);

const prodbuild = gulp.series(
  clean,
  gulp.parallel(htmls, styles, images, scripts, libs)
);

const build = options.env === 'production' ? prodbuild : devBuild;
options.env === 'production' ? null : watchFiles(); // in prod env close watchFiles.

module.exports = build;
