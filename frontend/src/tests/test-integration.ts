#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("Running integration tests for frontend components...");

// Ensure node_modules exists
if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
  console.log("Installing dependencies first...");
  spawnSync("npm", ["install"], { stdio: "inherit", shell: true });
}

// Run the integration tests with Jest
const jestCommand = "npx";
const jestArgs = [
  "jest",
  "--config=jest.config.js",
  '--testMatch="**/tests/integration/**/*.test.tsx"',
  "--runInBand", // Run tests sequentially
  "--forceExit", // Force exit after all tests complete
  "--no-cache", // Disable cache to ensure fresh tests
];

// Execute the tests
const result = spawnSync(jestCommand, jestArgs, {
  stdio: "inherit",
  shell: true,
});

// Output the results
if (result.status !== 0) {
  console.error("Frontend integration tests failed!");
  process.exit(1);
} else {
  console.log("Frontend integration tests completed successfully!");
}
