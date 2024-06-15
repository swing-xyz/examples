require("dotenv").config()
const webpack = require("webpack")

module.exports = function override(config, env) {
    config.plugins.push(
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.EnvironmentPlugin(["RPC_URL"]),
    )
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
    })
    config.resolve.fallback = {
        buffer: false,
        crypto: false,
        events: false,
        path: false,
        stream: false,
        fs: false,
        string_decoder: false,
        os: false,
        url: false,
    }
    return config
}
