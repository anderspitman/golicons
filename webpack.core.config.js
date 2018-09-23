const path = require('path');

module.exports = {
  entry: './src/core.js',
  output: {
    library: 'golicons',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'golicons-core.min.js',
  },
};
