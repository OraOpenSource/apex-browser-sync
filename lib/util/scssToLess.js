var through = require('through2');
var gutil = require('gulp-util');
var ext = gutil.replaceExtension;

module.exports = function() {
	var scssToLess = function(file, enc, cb) {

		file.contents = new Buffer(
			file.contents.toString()
				.replace(/\/s[ca]ss\//g, '/less/')
				.replace(/\.scss/g, '.less')
				.replace(/@mixin /g, '.')
				.replace(/@include /g, '.')
				.replace(/\$(\w+)/g, "@$1")
				.replace(/@extend ([\w\-\.]+);/g, "&:extend( $1 );")
				.replace(/ !default/g, '')
				.replace(/',/g, ',')
				.replace(/'\./g, '.')
				.replace(/\'/g, '"')
		        // .replace(/#{([^}]+)}/g, "~\"$1\"")
				.replace(/#{([^}]+)}/g, "$1")
				.replace(/~\"@(\w+)\"/g, "@{$1}")
				.replace(/adjust-hue\(/g, 'spin(')
                .replace(/.*alpha\(.*\r?\n/g, "")
                // delete lines containing ...
                .replace(/^.*@import.*$/mg, "")
                .replace(/^.*rgba\(@.*$/mg, "")

                .replace(/calc\((.*?)\);/g, "~\"calc($1)\";")

				.replace(
				/(@if)([^{]+)({)/g, function(match, m1, m2, m3) {
					var result = '& when (';
					result += m2.replace(/==/g, '=');
					result += ')' + m3;
					return result;
				})
            );

		file.path = ext(file.path, '.scss');
		this.push(file);
		cb();
	};
	return through.obj(scssToLess);
};
