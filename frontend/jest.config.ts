module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [".*\\.spec\\."],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "import.meta": {
      env: {
        VITE_API_URL: "http://localhost:8000/api/v1",
      },
    },
  },
};
