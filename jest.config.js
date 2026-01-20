module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./node_modules/react-native/jest/setup.js'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['module:@react-native/babel-preset'] }],
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
    '\\.js$': '<rootDir>/node_modules/react-native/jest/assetFileTransformer.js'
  },
  
  // Updated transformIgnorePatterns to include all required scopes
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-community|@rnmapbox/maps))'
  ],

  haste: {
    defaultPlatform: 'ios',
    platforms: ['android', 'ios', 'native'],
  },
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    '^@env$': '<rootDir>/__mocks__/envMock.js',
  },

  // Explicitly match test files to ensure new integration tests are included
  testMatch: [
    '**/__tests__/**/*.(js|ts|tsx)',
    '**/?(*.)+(spec|test).(js|ts|tsx)'
  ],

  collectCoverageFrom: [
    'App.{js,jsx,ts,tsx}',
    'screens/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/android/**',
    '!**/ios/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
};
