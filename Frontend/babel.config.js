module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      {
        unstable_transformProfile: 'default',
      },
    ],
  ],
  plugins: [],
  overrides: [
    {
      test: /\.(js|jsx|ts|tsx)$/,
      plugins: [
        [
          '@babel/plugin-transform-react-jsx',
          {
            runtime: 'classic',
          },
        ],
      ],
    },
  ],
};