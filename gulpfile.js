
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const rename = require('gulp-rename');
const notify = require("gulp-notify");
const smartgrid = require('smart-grid');
const isDev = process.argv.includes('--dev');
const isSync = process.argv.includes('--sync');
const replace = require('gulp-replace');

/*=== сбрасываем кэш у браузеров ===*/
const curTime = new Date().getTime();
function cacheBust() {
	return gulp
			.src('src/*.html')
			.pipe(replace(/cb=\d+/g, 'cb=' + curTime))
			.pipe(gulp.dest('build'));	
		
}

/*=== библиотеки и скрипты javascript ===*/
let jsFiles = [
	'node_modules/jquery/dist/jquery.min.js',
	'src/libs/tiny-slider.js',
	'src/js/custom.js',
];

function clean() {
	return del('build/*');
}

function styles() {
	return gulp
			.src('src/scss/styles.scss')
			.pipe(gulpif(isDev, sourcemaps.init()))
			.pipe(sass({
				outputStyle: 'expanded'
			}).on("error", notify.onError()))
			.pipe(gcmq())
			.pipe(autoprefixer(['last 15 versions']))
			
			.pipe(gulpif(!isDev /*is production*/ , cleanCSS({
				level: {1: { specialComments: 0}}
			})))
			.pipe(gulpif(isDev, sourcemaps.write()))
			.pipe(gulp.dest('build/css'))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function scripts() {
	return gulp
			.src(jsFiles)
			.pipe(gulpif(isDev, sourcemaps.init()))
			
			.pipe(concat('scripts.js'))
			.pipe(gulpif(isDev, sourcemaps.write()))
			.pipe(gulp.dest('build/js'))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function img() {
	return gulp
			.src('src/img/**/*')
			.pipe(cache(imagemin({
				interlaced: true,
				progressive: true,
				svgoPlugins: [{
					removeViewBox: false
				}],
				use: [pngquant({quality: [0.65, 0.7], speed: 5})]
			})))
			.pipe(gulp.dest('build/img'))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function fonts() {
	return gulp
			.src('src/fonts/**/*')
			.pipe(gulp.dest('build/fonts'))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function favicon() {
	return gulp
		.src('src/favicon.png')
		.pipe(gulp.dest('build'));
}

function html() {
	return gulp
			.src('src/*.html')
			.pipe(gulp.dest('build'))
			.pipe(gulpif(isSync, browserSync.stream()));
}

/*=== настройка брейкпоинтов для адаптивной сетки ===*/
function grid(done) {
	let settings = {
		outputStyle: 'scss',
		columns: 12,
		offset: "10px",
		mobileFirst: true,
		container: {
			maxWidth: "1130px",
			fields: "10px"
		},
		breakPoints: {
			xl: {
				width: "1100px",
			},
			md: {
				width: "960px",
			},
			sm: {
				width: "768px"
			},
			xs: {
				width: "576px"
			}
		},
	};
	smartgrid('src/scss', settings);
	done();
}

function watch() {
	if (isSync) {
		browserSync.init(null, {
			server: {
				baseDir: "build/",
			}
		});
	}

	gulp.watch('src/*.html', html);
	gulp.watch('src/scss/**/*.scss', styles);
	gulp.watch('src/img/**/*', img);
	gulp.watch(['src/libs/**/*.js', 'src/js/**/*.js'], scripts);
	
}

let build = gulp.series(clean,
	gulp.parallel(html, styles, scripts, img, fonts, favicon),
	cacheBust
);

gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);
gulp.task('build', build);
