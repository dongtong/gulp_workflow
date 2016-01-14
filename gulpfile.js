/*******************************************************************************************
  依赖
*******************************************************************************************/

var gulp = require('gulp'),                               //gulp核心
    sass = require('gulp-sass'),                          //sass编译器
    uglify = require('gulp-uglify'),                      //压缩js文件
    jshint = require('gulp-jshint'),                      //检查js是否OK
    rename = require('gulp-rename'),                      //重命名文件
    concat = require('gulp-concat'),                      //拼接js文件
    notify = require('gulp-notify'),                      //发送通知給OSX(如果你使用的是苹果操作系统)
    plumber = require('gulp-plumber'),                    //禁止gulp插件发生错误时,中断pipe
    stylish = require('jshint-stylish'),                  //格式化错误信息,使其在shell中可读性更强
    cssnano = require('gulp-cssnano'),                    //压缩css文件
    browserSync = require('browser-sync'),                //注入代码到所有文件中
    base64 = require('gulp-base64'),                      //图片base64编码
    autoprefixer = require('gulp-autoprefixer'),          //设置浏览器前缀
    htmlmin = require('gulp-html-minifier');              //压缩html
    

/*******************************************************************************************
  文件目标目录(相对路径)
*******************************************************************************************/

var target = {
  sass_src : 'src/scss/**/*.scss',                       //sass目录
  css_src : 'src/css/**/*.css',                          //css目录
  css_dest : 'build/css',                                //压缩后css目录
  js_lint_src : 'src/js/**/*.js',                        //检查js文件列表
  js_uglify_src : 'src/js/*.js',                         //列举js文件不被链接而是压缩
  js_concat_src : 'src/js/*.js',                         //不使用模块模式时链接
  js_dest : 'build/js',                                  //压缩后js目录
  html_src : 'src/*.html',                               //原html目录
  html_dest : 'build',                                   //压缩后html目录
  image_src : 'src/images',
  image_dest : 'build/images'
};

/*******************************************************************************************
  base64 config
*******************************************************************************************/

var base64Config = {
  src : 'src/css/*.css',
  dest : 'build/css',
  options: {
    baseDir : 'build',
    extensions: ['png'],
    maxImageSize: 20 * 1024,                            //小于20k使用base64
    bebug: true
  }
}

/*******************************************************************************************
  base64 Task
*******************************************************************************************/

gulp.task('base64', function () {
  gulp.src(base64Config.src)
      .pipe(base64(base64Config.options))
      .pipe(gulp.dest(base64Config.dest));
});

/*******************************************************************************************
  SASS Task
*******************************************************************************************/

gulp.task('sass', function () {
  gulp.src(target.sass_src)                             //获取sass文件目录
      .pipe(plumber())                                  //确保gulp在出现错误的时候能够继续运行
      .pipe(sass())                                     //编译sass
      .pipe(autoprefixer(                               //給css特性加上前缀
        'last 2 version',
        '> 1%',
        'ie 8',
        'ie 9',
        'ios 6',
        'android 4'
      ))
      .pipe(cssnano())                                  //压缩css
      .pipe(gulp.dest(target.css_dest))                 //将压缩后的css放入指定的位置
      .pipe(notify({message: 'SCSS编译处理完成!'}));      //通知OSX，任务已经完成
});

/*******************************************************************************************
  CSS Task
*******************************************************************************************/

gulp.task('css', function () {
  gulp.src(target.css_src)
      .pipe(cssnano())
      .pipe(rename(function (path) {                    //压缩后的文件加后缀名
        path.extname = '.min' + path.extname;
      }))
      .pipe(gulp.dest(target.css_dest))
      .pipe(notify({message: 'CSS压缩完成'}));
});

/*******************************************************************************************
  JS Task
*******************************************************************************************/

gulp.task('js-lint', function () {                      //lint
  gulp.src(target.js_lint_src)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish'))          //在shell中以一种优雅的方式展示
      .pipe(notify({message: 'jshint处理完成!'}));
});

gulp.task('js-uglify', function () {                    //压缩所有将要被连接的js
  gulp.src(target.js_uglify_src)
      .pipe(uglify())
      .pipe(rename(function (path) {                    //压缩后的文件加后缀名
        path.extname = '.min' + path.extname;
      }))
      .pipe(gulp.dest(target.js_dest))
      .pipe(notify({message: 'JS压缩处理完成!'}));
});

gulp.task('js-concat', function () {                    //压缩连接其他的js
  gulp.src(target.js_concat_src)
      .pipe(uglify())
      .pipe(concat('scripts.min.js'))                   //连接成一个文件
      .pipe(gulp.dest(target.js_dest))
      .pipe(notify({message: '压缩连接处理完成!'}));
});

/*******************************************************************************************
  Browser Sync Task
*******************************************************************************************/

gulp.task('browser-sync', function () {
  browserSync.create().init({
    browser: "google chrome",                          //默认使用chrome浏览器
    server: {
      baseDir: 'build'                                 //服务默认路径
    },
    port: 3333,
    files: [                                           //指定文件注入
      'build/*.html', 
      'build/css/*.css', 
      'build/js/*.js'
    ]       
  });
});

/*******************************************************************************************
  HTML Task
*******************************************************************************************/

gulp.task('html-mini', function () {
  gulp.src(target.html_src)
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(target.html_dest))
      .pipe(notify({message: 'HTML压缩处理完成!'}));
});

/*******************************************************************************************
  Image Task (gulp-image注意压缩图片质量)
*******************************************************************************************/

gulp.task('image', function () {
  gulp.src(target.image_src)
      .pipe(gulp.dest(target.image_dest))
      .pipe(notify({message: '图片处理完成!'}));
});

/*******************************************************************************************
  Gulp Tasks
*******************************************************************************************/

gulp.task('watch', ['browser-sync'], function () {
  
  gulp.watch(target.sass_src, ['sass']);
  
  gulp.watch(target.css_src, ['css']);
  
  gulp.watch(target.js_lint_src, ['js-lint']);
  
  gulp.watch(target.js_minify_src, ['js-uglify']);
  
  gulp.watch(target.js_concat_src, ['js-concat']);
  
  gulp.watch(target.html_src, ['html-mini']);
  
  gulp.watch(target.image_src, ['image']);
  
});

gulp.task('default', [
  'css', 
  'js-lint', 
  'js-uglify', 
  'html-mini', 
  'image', 
  'browser-sync', 
  'watch'
], function () {
 notify({message: 'App处理完成!'});
});