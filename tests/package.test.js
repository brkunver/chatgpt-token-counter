/**
 * Testing library/framework: Node.js built-in test runner (node:test) + assert/strict.
 * Scope: Validates package.json aligns with PR diff expectations (metadata, scripts, deps).
 * No external dependencies are introduced.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgPath = path.resolve(__dirname, '..', 'package.json');

async function loadPkg() {
  const raw = await readFile(pkgPath, 'utf8');
  return JSON.parse(raw);
}

const semverRE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const expectedMeta = {
  name: 'ChatGPT Token Counter',
  description: 'Count tokens in real time on chatgpt conversation',
  private: true,
  version: '1.1.1',
  type: 'module',
};

const expectedScripts = {
  dev: 'wxt',
  'dev:firefox': 'wxt -b firefox',
  build: 'wxt build',
  'build:firefox': 'wxt build -b firefox',
  zip: 'wxt zip',
  'zip:firefox': 'wxt zip -b firefox',
  compile: 'tsc --noEmit',
  postinstall: 'wxt prepare',
};

const expectedDeps = {
  '@wxt-dev/i18n': '^0.2.4',
  'gpt-tokenizer': '^2.9.0',
  react: '^19.1.1',
  'react-dom': '^19.1.1',
};

const expectedDevDeps = {
  '@tailwindcss/vite': '^4.1.12',
  '@types/react': '^19.1.10',
  '@types/react-dom': '^19.1.7',
  '@wxt-dev/module-react': '^1.1.3',
  prettier: '^3.6.2',
  'prettier-plugin-tailwindcss': '^0.6.14',
  tailwindcss: '^4.1.12',
  typescript: '^5.9.2',
  wxt: '^0.20.8',
};

test('package.json exists and parses as valid JSON', async () => {
  const pkg = await loadPkg();
  assert.ok(pkg && typeof pkg === 'object', 'Parsed package.json should be an object');
});

test('basic metadata fields are present and correct', async () => {
  const pkg = await loadPkg();

  for (const [key, expected] of Object.entries(expectedMeta)) {
    assert.ok(key in pkg, `Missing field: ${key}`);
    assert.equal(pkg[key], expected, `Expected ${key}="${expected}"`);
  }

  assert.match(pkg.version, semverRE, 'version must be a valid semver');
});

test('scripts include required commands with exact values', async () => {
  const pkg = await loadPkg();
  assert.ok(pkg.scripts && typeof pkg.scripts === 'object', 'scripts should be an object');

  for (const [name, value] of Object.entries(expectedScripts)) {
    assert.ok(name in pkg.scripts, `Missing script: ${name}`);
    assert.equal(pkg.scripts[name], value, `Script "${name}" mismatch`);
  }
});

test('dependencies include required entries with expected versions', async () => {
  const pkg = await loadPkg();
  assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object', 'dependencies should be an object');

  for (const [dep, range] of Object.entries(expectedDeps)) {
    assert.ok(dep in pkg.dependencies, `Missing dependency: ${dep}`);
    assert.equal(pkg.dependencies[dep], range, `Dependency "${dep}" version mismatch`);
    const val = pkg.dependencies[dep];
    if (!val.startsWith('workspace:') && !val.startsWith('file:') && !val.startsWith('link:')) {
      assert.match(val, /^[~^]\d+\.\d+\.\d+.*$/, `${dep} should use ^ or ~ semver range`);
    }
  }
});

test('devDependencies include required entries with expected versions', async () => {
  const pkg = await loadPkg();
  assert.ok(pkg.devDependencies && typeof pkg.devDependencies === 'object', 'devDependencies should be an object');

  for (const [dep, range] of Object.entries(expectedDevDeps)) {
    assert.ok(dep in pkg.devDependencies, `Missing devDependency: ${dep}`);
    assert.equal(pkg.devDependencies[dep], range, `DevDependency "${dep}" version mismatch`);
    const val = pkg.devDependencies[dep];
    if (!val.startsWith('workspace:') && !val.startsWith('file:') && !val.startsWith('link:')) {
      assert.match(val, /^[~^]\d+\.\d+\.\d+.*$/, `${dep} should use ^ or ~ semver range`);
    }
  }
});

test('trustedDependencies contains required packages and no duplicates', async () => {
  const pkg = await loadPkg();
  assert.ok(Array.isArray(pkg.trustedDependencies), 'trustedDependencies should be an array');

  const list = pkg.trustedDependencies;
  for (const name of ['@tailwindcss/oxide', 'spawn-sync']) {
    assert.ok(list.includes(name), `trustedDependencies should include "${name}"`);
  }

  assert.equal(new Set(list).size, list.length, 'trustedDependencies should not contain duplicates');
});

test('scripts use expected tools and flags (sanity checks)', async () => {
  const pkg = await loadPkg();
  const s = pkg.scripts || {};

  for (const k of ['dev', 'dev:firefox', 'build', 'build:firefox', 'zip', 'zip:firefox']) {
    if (k in s) {
      assert.ok(/^wxt(\s|$)/.test(s[k]), `Script "${k}" should start with "wxt"`);
    }
  }
  if ('compile' in s) assert.equal(s.compile, 'tsc --noEmit');
  if ('postinstall' in s) assert.equal(s.postinstall, 'wxt prepare');
});