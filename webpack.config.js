var path = require("path");
module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, "./build"),
        library: "trailer3d",
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    module: {
        loaders: [{
            test: /^.*\.css$/,
            loader: "style-loader!css-loader"
        }, {
            test: /^.*\.(png|jpg)$/,
            loader: "url-loader"
        }, {
            test: /\.json$/,
            loader: "json"
        }, {
            test: /\.(html|txt)$/,
            loader: "raw-loader"
        }]
    },
    plugins: []

};