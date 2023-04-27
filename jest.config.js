module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.spec.(js|ts)'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['packages/**/*.ts'],
  };
  