
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

let jsFiles = [
	'node_modules/jquery/dist/jquery.min.js',
	'./src/js/custom.js',
];

const paths = {
	html: {
		src: './src/*.html',
		dest: 'build'
	},
	styles: {
		src: './src/scss/styles.scss',
		dest: 'build/css'
	},
	scripts: {
		src: jsFiles,
		dest: 'build/js'
	},
	fonts: {
		src: './src/fonts/**/*',
		dest: 'build/fonts'
	},
	img: {
		src: './src/img/**/*',
		dest: 'build/img'
	},
	gridsmart: {
		src: './src/scss'
	}
};

const curTime = new Date().getTime();
function cacheBust() {
	return gulp
			.src(paths.html.src)
			.pipe(replace(/cb=\d+/g, 'cb=' + curTime))
			.pipe(gulp.dest(paths.html.dest));	
		
}

function clean() {
	return del('./build/*');
}

function styles() {
	return gulp
			.src(paths.styles.src)
			.pipe(gulpif(isDev, sourcemaps.init()))
			.pipe(sass({
				outputStyle: 'expanded'
			}).on("error", notify.onError()))
			.pipe(gcmq())
			.pipe(autoprefixer(['last 15 versions']))
			
			.pipe(gulpif(!isDev /*is production*/ , cleanCSS({
				level: {1: { specialComments: 0}}
			})))
			.pipe(gulpif(!isDev /*is production*/ , rename({
				suffix: '.min',
				prefix: ''
			})))
			.pipe(gulpif(isDev, sourcemaps.write()))
			.pipe(gulp.dest(paths.styles.dest))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function scripts() {
	return gulp
			.src(paths.scripts.src, {allowEmpty: true})
			.pipe(gulpif(isDev, sourcemaps.init()))
			
			.pipe(concat('scripts.js'))
			.pipe(gulpif(!isDev /*is production*/ , rename({
				suffix: '.min'
			})))
			.pipe(gulpif(isDev, sourcemaps.write()))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function img() {
	return gulp
			.src(paths.img.src)
			.pipe(cache(imagemin({
				interlaced: true,
				progressive: true,
				svgoPlugins: [{
					removeViewBox: false
				}],
				use: [pngquant()]
			})))
			.pipe(gulp.dest(paths.img.dest))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function fonts() {
	return gulp
			.src(paths.fonts.src)
			.pipe(gulp.dest(paths.fonts.dest))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function html() {
	return gulp
			.src(paths.html.src)
			.pipe(gulp.dest(paths.html.dest))
			.pipe(gulpif(isSync, browserSync.stream()));
}

function grid(done) {
	let settings = {
		outputStyle: 'scss',
		columns: 12,
		offset: "10px",
		container: {
			maxWidth: "1140px",
			fields: "15px"
		},
		breakPoints: {
			// xl: {
			// 	width: "1280px",
			// },
			// md: {
			// 	width: "920px",
			// },
			sm: {
				width: "768px"
			},
			xs: {
				width: "576px"
			}
		},
	};
	smartgrid(paths.gridsmart.src, settings);
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

	
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.img.src, img).on('change', browserSync.reload);
	gulp.watch(['./src/libs/**/*.js', './src/js/**/*.js'], scripts).on('change', browserSync.reload);
	gulp.watch('./src/*.html', html).on('change', browserSync.reload);
}

let build = gulp.series(
	clean,
	gulp.parallel(html, styles, scripts, img, fonts),
	cacheBust
);

gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);
gulp.task('build', build);
