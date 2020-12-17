# alphaville-build-tools
## NO LONGER IN USE - functionality has been merged into `alphaville-longroom` as that is now the only app that uses it
Creates gulp tasks for Alphaville 2 specific services.

## How to use it
First of all, install it through npm.

```
npm install Financial-Times/alphaville-build-tools
```

In your project's `gulpfile.js`, require the module, and call it with the parameters `gulp` and a config object.

```js
const alphavilleBuildTools = require('alphaville-build-tools');
const gulp = require('gulp');
const env = 'test'; // or 'prod'

alphavilleBuildTools(gulp, {
    env: env,
    buildFolder: 'public/build',
    builds: [
        {
            id: 'main',
            standalone: 'mainBundle',
            js: './assets/js/main.js',
            sass: './assets/scss/main.scss',
            buildJs: 'main.js',
            buildCss: 'main.css'
        }
    ]
});
```

### Configuration

 * env: environment in which it builds: `test` or `prod`. Default: `test`.
 * buildFolder: folder into which to create the generated JS and CSS files. The folder is relative to the project. Default: 'public/build'.
 * builds:
    + id: optional, it will be used to create the gulp task (i.e. `obt-build-{id}`)
    + origami build tools options, for more information see: https://github.com/Financial-Times/origami-build-tools#build

### Tasks created

 - build-config-dir: creates the folders `build_config/js` and `build_config/scss`, used for built time generated files
 - fingerprint: creates fingerprint files (`build_config/js/fingerprint.js`, `build_config/scss/fingerprint.scss`). The scss variable is: `$fingerprint`.
 - assets-domain-config: creates files assets base domain configuration (`build_config/js/assetsDomain.js`, `build_config/scss/assetsDomain.scss`). The scss variable is: `$assets-domain`.
 - bower-update: runs `bower update` command using local bower
 - bower-install: runs `bower install` command using local bower
 - bower-clean: clears bower's cache
 - clean-build: deletes the folder `buildFolder` from the config
 - obt-verify: Uses origami build tools' verify task (i.e. https://github.com/Financial-Times/origami-build-tools#verify), but with custom rules. See the rules in the config folder.
 - obt-build-{id}: Uses origami build tools' build task (i.e. https://github.com/Financial-Times/origami-build-tools#build) for individual builds.
 - obt-build: Runs all the build tasks (`obt-build-{id}`) in parallel.
 - verify: Alias for `obt-verify`
 - build: A sequence of the following tasks: `clean-build`, `build-config-dir`, `fingerprint`, `assets-domain-config`, `obt-build`.
 - obt: Runs `verify` and `build`.
 - watch: Runs `obt-build` for any changes in the folder `./assets`
 - default: A sequence of the following tasks: `bower-update`, `bower-install`, `build`
