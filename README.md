# What is this.

Really simple webapp bootstrapper for MYSELF.  

I said "MYSELF".


# Requirements

node
npm (with npx)


# Recommended Global NPM packages

    npm install -g gulp-cli typescript tslint typings


# Usage

Just install all dev-dependencies with `npm install`.

    npm install

Then Do Your Thing.  
`workspace.config.js` includes basic build options. Edit below configs appropriately.

As default, `./src` is treaded as working-space.

- gulpfile.js
- workspace.config.js
- workspace.helper.js
- webpack.config.js
- webpack.config.module.js
- webpack.config.factory.js



## Available tasks

Use like `npx gulp YOUR_TASK_NAME`.

### Basic
- build -- Builds all.
- browser -- Starts browser-sync with server.
- observe -- Starts observing file-changes with `gulp.watch`
- clean -- Cleans up CONFIG.DEST directory.
- pack -- `clean` then `build`
- watch -- `pack` then `observe`

### Webpack
- webpack:server
- webpack:watch 
- webpack:build 


## Building Production Distribution

Just add `--mode production` part to your commands.
Passes `mode` to the webpack instance.

    npx gulp --mode production
