/*******************************************************************************************
  依赖
*******************************************************************************************/

var gulp = require('gulp'),                               //gulp核心
    uglify = require('gulp-uglify'),                      //压缩js文件
    jshint = require('gulp-jshint'),                      //检查js是否OK
    rename = require('gulp-rename'),                      //重命名文件
    concat = require('gulp-concat'),                      //拼接js文件
    notify = require('gulp-notify'),                      //发送通知給OSX(如果你使用的是苹果操作系统)
    plumber = require('gulp-plumber'),                    //禁止gulp插件发生错误时,中断pipe
    stylish = require('jshint-stylish'),                  //格式化错误信息,使其在shell中可读性更强
    cssnano = require('gulp-cssnano'),                    //压缩css文件
    browserSync = require('browser-sync'),                //注入代码到所有文件中(https://browsersync.io/docs/options/)
    base64 = require('gulp-base64'),                      //图片base64编码
    autoprefixer = require('gulp-autoprefixer'),          //设置浏览器前缀
    htmlmin = require('gulp-html-minifier'),              //压缩html
    browserify = require('browserify'),                   //browserify引入CommonJS规范
    source = require('vinyl-source-stream'),              //将常规流转换为包含 Stream 的 vinyl 对象
    glob = require('glob'),                               //把多个文件添加到 browserify 中
    buffer = require('vinyl-buffer');                     //将 vinyl 对象内容中的 Stream 转换为 Buffer
    

/*******************************************************************************************
  文件目标目录(相对路径)
*******************************************************************************************/

var target = {
  css_src : 'src/css/**/*.css',                          //css目录
  css_dest : 'build/css',                                //压缩后css目录
  js_lint_src : 'src/js/**/*.js',                        //检查js文件列表
  js_uglify_src : 'src/js/*.js',                         //列举js文件不被链接而是压缩
  js_concat_src : 'src/js/*.js',                         //不使用模块模式时链接
  js_dest : 'build/js',                                  //压缩后js目录
  html_src : 'src/*.html',                               //原html目录
  html_dest : 'build',                                   //压缩后html目录
  image_src : 'src/images/*.*',
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
  CSS Task
*******************************************************************************************/

gulp.task('css', function () {
  gulp.src(target.css_src)
      .pipe(cssnano())
      .pipe(rename({suffix: '.min'}))                    //压缩后的文件加后缀名
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

gulp.task('js-bundle', function () {                    //browserify, uglify
  glob(target.js_uglify_src, {}, function(err, files) {
    var b = browserify();
    files.forEach(function(file) {
      
      var fileParts = file.split('/'),
          filename = fileParts[fileParts.length - 1];

      return  browserify({                              //针对每个业务js打包压缩
                debug: true,
                entries: file,
                extensions: ['js']
              })
              .bundle()
              .pipe(source(filename))
              .pipe(plumber({
                errorHandler: function (err) {
                  console.log("JS browserify出错: --->");
                  console.log(err.message);
                  this.emit('end');
                }
              }))
              .pipe(gulp.dest(target.js_dest))
              .pipe(rename({suffix: '.min'}))
              .pipe(buffer())
              .pipe(uglify())
              .pipe(gulp.dest(target.js_dest))
              .pipe(browserSync.reload({stream: true}))
              .pipe(notify({message: 'JS browserify完成!'}));
    });
  });
});

/*******************************************************************************************
  Browser Sync Task
*******************************************************************************************/

gulp.task('browser-sync', function () {
  browserSync.create().init({
    notify: false,                                     //浏览器上不显示通知信息
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

gulp.task('html-mini', function () {                   //压缩HTML
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
  
  gulp.watch(target.css_src, ['css']);
  
  gulp.watch(target.js_lint_src, ['js-lint']);
  
  gulp.watch(target.js_uglify_src, ['js-bundle']);
  
  gulp.watch(target.html_src, ['html-mini']);
  
  gulp.watch(target.image_src, ['image']);
  
});

gulp.task('default', [
  'css', 
  'js-lint', 
  'js-bundle', 
  'html-mini', 
  'image', 
  'browser-sync', 
  'watch'
]);
