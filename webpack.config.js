const path = require('path');

module.exports = {
  output: {
    library: 'golicons',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'golicons.min.js',
  },
};
