#!/usr/bin/env ts-node

import { spawnSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

// Create test-output directory if it doesn't exist
const outputDir = path.join(__dirname, 'test-output');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

console.log('Running integration tests for AI Code Review Assistant...');

// Run the tests directly with jest
const result = spawnSync('npx', ['jest', 'tests/integration', '--forceExit'], { 
  stdio: 'inherit',
  shell: true
});

// Output the results
if (result.status !== 0) {
  console.error('Integration tests failed!');
  process.exit(1);
} else {
  console.log('Integration tests completed successfully!');
}