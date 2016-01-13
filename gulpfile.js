/*******************************************************************************************
1. 依赖
*******************************************************************************************/

var gulp = require('gulp'),                               //gulp核心
    sass = require('gulp-sass'),                          //sass编译器
    uglify = require('gulp-uglify'),                      //压缩js文件
    jshint = require('gulp-jshint'),                      //检查js是否OK
    rename = require('gulp-rename'),                      //重命名文件
    concat = require('gulp-concat'),                      //拼接js文件
    notify = require('gulp-notify'),                      //发送通知給OSX(如果你使用的是苹果操作系统)
    plumber = require('gulp-plumber'),                    //禁止gulp插件发生错误时,中断pipe
    stylish = require('gulp-stylish'),                    //格式化错误信息,使其在shell中可读性更强
    minifycss = require('gulp-minify-css'),               //压缩css文件
    browserSync = require('browser-sync'),                //注入代码到所有文件中
    autoprefixer = require('gulp-autoprefixer');          //设置浏览器前缀
    

/*******************************************************************************************
2. 文件目标目录(相对路径)
*******************************************************************************************/

var target = {
  sass_src : 'scss/**/*.scss',                           //sass目录
  css_dest : 'css',                                      //压缩后css目录
  js_lint_src : [                                        //检查js文件列表
    'js/build/app.js',
    'js/build/custom/switch.js',
    'js/build/custom/scheme-loader.js'
  ],
  js_uglify_src : [                                      //列举js文件不被链接而是压缩
    'js/build/custom/scheme-loader.js',
    'js/build/vendor/modernizr.js'
  ],
  js_concat_src : [                                      //拼接js列表
    'js/build/vendor/skrollr.js',
    'js/build/vendor/jquery.js'
  ],
  js_dest : 'js'                                         //压缩后js目录
}

/*******************************************************************************************
3. SASS Task
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
      .pipe(minifycss())                                //压缩css
      .pipe(gulp.dest(target.css_dest))                 //将压缩后的css放入指定的位置
      .pipe(notify({message: 'SCSS 处理完成'}));         //通知OSX，任务已经完成
});

/*******************************************************************************************
4. JS Task
*******************************************************************************************/