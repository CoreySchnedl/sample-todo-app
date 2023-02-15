module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test", "<rootDir>/backend-rest-api/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
