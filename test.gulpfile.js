const path = require('path');
const { src, dest } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const stylelint = require('gulp-stylelint');

const outputDir = path.resolve(__dirname, 'tmp');

function sassTask() {
  return src(['tests/**/*.scss'])
    .pipe(sass({ outputStyle: "expanded", precision: 8 }))
    .pipe(autoprefixer())
    .pipe(stylelint({
      failAfterError: false,
      reporters: [
        { formatter: 'string', console: true }
      ],
      fix: true
    }))
    .pipe(dest(outputDir));
}

exports.default = sassTask;
 