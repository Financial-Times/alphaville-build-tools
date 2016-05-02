const obt = require('origami-build-tools');
const del = require('del');
const runSequence = require('run-sequence');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');


function ensureDirectoryExistence (filePath) {
	const dirname = path.dirname(filePath);

	if (directoryExists(dirname)) {
		return true;
	}

	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

function directoryExists(path) {
	try {
		return fs.statSync(path).isDirectory();
	} catch (err) {
		return false;
	}
}

function generateRandomString(length) {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}


module.exports = function (gulp, config) {
	gulp.task('build-config-dir', function () {
		ensureDirectoryExistence('build_config/js/test.js');
		ensureDirectoryExistence('build_config/scss/test.scss');
	});

	gulp.task('fingerprint', function(callback) {
		const fingerprint = generateRandomString(10);

		fs.writeFileSync('build_config/js/fingerprint.js', `module.exports="${fingerprint}";`);
		fs.writeFileSync('build_config/scss/fingerprint.scss', `$fingerprint: '${fingerprint}';`);
		callback();
	});

	gulp.task('assets-domain-config', function(callback) {
		let assetsDomain = '';
		if (config.env === 'prod') {
			assetsDomain = '//alphaville-h2.ft.com';
		}

		fs.writeFileSync('build_config/js/assetsDomain.js', `module.exports="${assetsDomain}";`);
		fs.writeFileSync('build_config/scss/assetsDomain.scss', `$assets-domain: '${assetsDomain}';`);

		callback();
	});


	gulp.task('bower-update', function (callback) {
		exec('./node_modules/bower/bin/bower update', callback);
	});

	gulp.task('bower-install', function (callback) {
		exec('./node_modules/bower/bin/bower install', callback);
	});

	gulp.task('bower-clean', function (callback) {
		exec('./node_modules/bower/bin/bower cache clean', callback);
	});

	gulp.task('clean-build', function (callback) {
		del(['./public/build'], callback);
	});

	gulp.task('obt-verify', function() {
		return obt.verify(gulp, {
			scssLintPath: path.join(__dirname, './node_modules/alphaville-build-tools/config/scss-lint.yml'),
			esLintPath: path.join(__dirname, './node_modules/alphaville-build-tools/config/.eslintrc'),
			editorconfigPath: path.join(__dirname, './node_modules/alphaville-build-tools/config/.editorconfig')
		});
	});


	const buildTasks = [];
	config.builds.forEach(function (buildConfig) {
		const baseBuildConfig = {};

		if (config.buildFolder) {
			baseBuildConfig.buildFolder = config.buildFolder;
		}

		if (config.env) {
			baseBuildConfig.env = config.env === 'prod' ? 'production' : 'development';
		}

		Object.assign(baseBuildConfig, buildConfig);

		const buildTaskName = 'obt-build-' + (buildConfig.id || generateRandomString(5));
		buildTasks.push(buildTaskName);

		gulp.task(buildTaskName, function () {
			return obt.build(gulp, baseBuildConfig);
		});
	});

	gulp.task('obt-build', ['obt-build-main']);

	gulp.task('verify', ['obt-verify']);
	gulp.task('build', function (callback) {
		runSequence('clean-build', 'build-config-dir', 'fingerprint', 'assets-domain-config', 'obt-build', callback);
	});

	gulp.task('obt', ['verify', 'build']);
	gulp.task('default', function (callback) {
		runSequence('bower-update', 'bower-install', 'obt', callback);
	});

	gulp.task('watch', function() {
		gulp.watch(['./assets/**'], ['obt-build']);
	});

	return gulp;
};
