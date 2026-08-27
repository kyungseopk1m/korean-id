/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs'],
  moduleNameMapper: {
    // ESM 소스가 쓰는 './x.js' 확장자를 테스트에서 './x.ts'로 되돌린다
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // CLI 테스트는 dist가 있어야 돌아간다. `npm run test:cli`가 build 후 따로 실행한다.
  testPathIgnorePatterns: ['/node_modules/', '/__test__/cli\\.test\\.ts$'],
};

export default config;
