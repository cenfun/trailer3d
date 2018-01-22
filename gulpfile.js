"use strict";

var gulp = require('gulp');
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var inject = require("gulp-inject");
var browserSync = require('browser-sync').create("my_demo_server");

var build_name = "trailer3d";


gulp.task('default', ['init', 'build', "inject", 'preview', 'watch']);

gulp.task("init", function() {


});


gulp.task("build", function() {

    browserSync.notify("building ...");

    var myConfig = Object.create(webpackConfig);
    myConfig.output.filename = build_name + ".js";
    myConfig.devtool = "#source-map";
    // run webpack
    webpack(myConfig, function(err, stats) {
        if (err) {
            throw new Error(err);
        }
        browserSync.reload();
    });

});

gulp.task("min", function() {

    browserSync.notify("minify building ...");

    var myConfig = Object.create(webpackConfig);
    myConfig.output.filename = build_name + ".min.js";
    myConfig.devtool = "#source-map";
    myConfig.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true,
                warnings: false
            },
            output: {
                comments: false
            }
        })
    ];
    // run webpack
    webpack(myConfig, function(err, stats) {
        if (err) {
            throw new Error(err);
        }
    });
});


gulp.task("preview", function() {
    //https://www.npmjs.com/package/browser-sync
    //https://browsersync.io/docs/options
    browserSync.init({
        port: 8080,
        ui: {
            port: 8081
        },
        //proxy: ""
        server: ["./demo", "./"]
    });

});

gulp.task('watch', function() {
    gulp.watch(["./src/**/*"], ['build']);
    gulp.watch(["./demo/**/*", "./build/**/*"]).on('change', function() {
        browserSync.reload();
    });
});


gulp.task("inject", function() {


});