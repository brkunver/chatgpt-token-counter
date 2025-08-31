/**
 * Testing framework: Node.js built-in test runner (node:test) with assert/strict.
 * Rationale: No third-party test framework detected; avoids introducing new dependencies.
 * Scope: Validates package.json keys and values (scripts, dependencies, devDependencies, metadata, trustedDependencies).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = resolve(__dirname, '../package.json');
const pkgJson = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgJson);

// Expected values derived from current PR diff snippet for targeted validation
const expectedMetadata = {
  name: 'ChatGPT Token Counter',
  description: 'Count tokens in real time on chatgpt conversation',
  private: true,
  version: '1.1.1',
  type: 'module',
};

const expectedScripts = {
  'dev': 'wxt',
  'dev:firefox': 'wxt -b firefox',
  'build': 'wxt build',
  'build:firefox': 'wxt build -b firefox',
  'zip': 'wxt zip',
  'zip:firefox': 'wxt zip -b firefox',
  'compile': 'tsc --noEmit',
  'postinstall': 'wxt prepare',
};

const expectedDependencies = {
  '@wxt-dev/i18n': '^0.2.4',
  'gpt-tokenizer': '^2.9.0',
  'react': '^19.1.1',
  'react-dom': '^19.1.1',
};

const expectedDevDependencies = {
  '@tailwindcss/vite': '^4.1.12',
  '@types/react': '^19.1.10',
  '@types/react-dom': '^19.1.7',
  '@wxt-dev/module-react': '^1.1.3',
  'prettier': '^3.6.2',
  'prettier-plugin-tailwindcss': '^0.6.14',
  'tailwindcss': '^4.1.12',
  'typescript': '^5.9.2',
  'wxt': '^0.20.8',
};

const expectedTrusted = ['@tailwindcss/oxide', 'spawn-sync'];

test('package.json: parses as valid JSON', () => {
  assert.doesNotThrow(() => JSON.parse(pkgJson));
  assert.equal(typeof pkg, 'object');
});

test('package.json: basic metadata is correct', () => {
  assert.equal(pkg.name, expectedMetadata.name);
  assert.equal(pkg.description, expectedMetadata.description);
  assert.equal(pkg.private, expectedMetadata.private);
  assert.equal(pkg.type, expectedMetadata.type);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'version must be valid semver');
  assert.equal(pkg.version, expectedMetadata.version);
});

test('package.json: required scripts exist with exact commands', () => {
  assert.ok(pkg.scripts && typeof pkg.scripts === 'object', 'scripts object missing');
  for (const [key, val] of Object.entries(expectedScripts)) {
    assert.ok(Object.prototype.hasOwnProperty.call(pkg.scripts, key), `missing script: ${key}`);
    assert.equal(pkg.scripts[key], val, `script ${key} should be "${val}"`);
    assert.ok(typeof pkg.scripts[key] === 'string' && pkg.scripts[key].trim().length > 0, `script ${key} must be non-empty`);
  }
});

test('package.json: firefox-targeted scripts consistently use "-b firefox"', () => {
  const firefoxKeys = ['dev:firefox', 'build:firefox', 'zip:firefox'];
  for (const key of firefoxKeys) {
    assert.ok(pkg.scripts[key].includes('-b firefox'), `script ${key} must include "-b firefox"`);
  }
});

test('package.json: compile script performs non-emitting TS check', () => {
  assert.ok(pkg.scripts.compile.startsWith('tsc'), 'compile script must start with "tsc"');
  assert.ok(pkg.scripts.compile.includes('--noEmit'), 'compile script must include "--noEmit"');
});

test('package.json: dependencies include expected packages and versions', () => {
  assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object', 'dependencies missing');
  for (const [dep, range] of Object.entries(expectedDependencies)) {
    assert.ok(Object.prototype.hasOwnProperty.call(pkg.dependencies, dep), `missing dependency: ${dep}`);
    assert.equal(pkg.dependencies[dep], range, `dependency ${dep} should be "${range}"`);
    assert.match(pkg.dependencies[dep], /^\^?\d+\.\d+\.\d+/, `dependency ${dep} must use a valid semver-like range`);
  }
  // Keep React packages aligned
  assert.equal(pkg.dependencies.react, pkg.dependencies['react-dom'], 'react and react-dom versions should match');
});

test('package.json: devDependencies include expected toolchain and versions', () => {
  assert.ok(pkg.devDependencies && typeof pkg.devDependencies === 'object', 'devDependencies missing');
  for (const [dep, range] of Object.entries(expectedDevDependencies)) {
    assert.ok(Object.prototype.hasOwnProperty.call(pkg.devDependencies, dep), `missing devDependency: ${dep}`);
    assert.equal(pkg.devDependencies[dep], range, `devDependency ${dep} should be "${range}"`);
    assert.match(pkg.devDependencies[dep], /^\^?\d+\.\d+\.\d+/, `devDependency ${dep} must use a valid semver-like range`);
  }
});

test('package.json: trustedDependencies are exactly as expected and unique', () => {
  assert.ok(Array.isArray(pkg.trustedDependencies), 'trustedDependencies must be an array');
  assert.deepEqual(pkg.trustedDependencies, expectedTrusted);
  const set = new Set(pkg.trustedDependencies);
  assert.equal(set.size, pkg.trustedDependencies.length, 'trustedDependencies must not contain duplicates');
});

test('package.json: required string fields are non-empty', () => {
  for (const key of ['name', 'description', 'version', 'type']) {
    assert.equal(typeof pkg[key], 'string', `${key} must be a string`);
    assert.ok(pkg[key].trim().length > 0, `${key} must be non-empty`);
  }
});