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
      .pipe(notify({message: 'SCSS编译处理完成!'}));      //通知OSX，任务已经完成
});

/*******************************************************************************************
4. JS Task
*******************************************************************************************/

gulp.task('js-lint', function () {                      //lint
  gulp.src(target.js_lint_src)
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));                  //在shell中以一种优雅的方式展示
});

gulp.task('js-uglify', function () {                    //压缩所有将要被连接的js
  gulp.src(target.js_uglify_src)
      .pipe(uglify())
      .pipe(rename(function (dir, base, ext) {          //压缩后的文件加后缀名
        var trunc = base.split('.')[0];
        return trunc + '.min' + ext;
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
5. Browser Sync Task
*******************************************************************************************/

gulp.task('browser-sync', function () {
  browserSync.init(['css/*.css', 'js/*.js'], {          //指定文件注入
    proxy: {
      host: 'localhost',
      port: '2345'
    }
  });
});

/*******************************************************************************************
6. Gulp Tasks
*******************************************************************************************/

gulp.task('default', function () {
  gulp.run('sass', 'js-lint', 'js-uglify', 'js-concat', 'browser-sync');
  
  gulp.watch('scss/**/*.scss', function () {
    gulp.run('sass');
  });
  
  gulp.watch(target.js_lint_src, function () {
    gulp.run('js-lint');
  });
  
  gulp.watch(target.js_minify_src, function () {
    gulp.run('js-uglify');
  });
  
  gulp.watch(target.js_concat_src, function () {
    gulp.run('js-concat');
  });
});