const path = require('path');

module.exports = {
  mode: 'production',

  entry: path.resolve(__dirname, 'src/main.js'), // 👈 change if your file name is different

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  }
};
