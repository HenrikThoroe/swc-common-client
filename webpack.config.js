const path = require("path")

module.exports = {
    entry: './src/index.ts',
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                // include: [/node_modules/]
                // exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.json' ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    target: 'node'
}