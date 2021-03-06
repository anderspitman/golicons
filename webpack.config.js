const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'golicons',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'golicons.min.js',
  },
};
