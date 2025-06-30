const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [/monaco-editor/],
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}; 