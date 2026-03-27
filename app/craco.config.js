const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      'contexts': path.resolve(__dirname, 'src/contexts'),
      'services': path.resolve(__dirname, 'src/services'),
      'types': path.resolve(__dirname, 'src/types'),
      'pages': path.resolve(__dirname, 'src/pages'),
      'utils': path.resolve(__dirname, 'src/utils'),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        util: require.resolve('util'),
        zlib: require.resolve('zlib-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        crypto: require.resolve('crypto-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser'),
      };

      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      });

      return webpackConfig;
    },
  },
  typescript: {
    enableTypeChecking: true,
  },
};