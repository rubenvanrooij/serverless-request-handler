module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
    globals: {
      'ts-jest': {
        babelConfig: false
      }
    },
    collectCoverage: true,
    moduleDirectories: ['node_modules', 'lib'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    roots: ['<rootDir>/lib'],
    testPathIgnorePatterns: ['/node_modules/'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['lib/**/*.{ts,tsx,js,jsx}', '!lib/**/*.d.ts', '!lib/index.ts']
  }