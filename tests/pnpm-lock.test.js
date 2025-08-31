// creating new pnpm lock tests file
/**
 * Extended unit tests for pnpm-lock.yaml validation.
 * Notes:
 * - Testing framework: Using the project's existing test runner (Jest/Vitest style) with describe/it/expect globals.
 * - These tests are non-invasive: they read the lockfile and assert structural and policy constraints.
 */
const fs = require('fs');
const path = require('path');

function readLockfile(lockPath = path.resolve(process.cwd(), 'pnpm-lock.yaml')) {
  try {
    const buf = fs.readFileSync(lockPath);
    return buf.toString('utf8');
  } catch (e) {
    return null;
  }
}

function hasOnlyHttpsTarballs(text) {
  // Common pattern in lockfiles: tarball: https://registry.npmjs.org/...
  const httpMatches = text.match(/(^|\s)http:\/\/\S+/gim);
  return !httpMatches;
}

function findProtocols(text, proto) {
  const re = new RegExp(String.raw`${proto}:`, 'g');
  const all = text.match(re);
  return all ? all.length : 0;
}

function extractLockfileVersion(text) {
  // Look for top-level lockfileVersion: N
  const m = text.match(/^\s*lockfileVersion:\s*("?)(\d+)\1\s*$/m);
  return m ? Number(m[2]) : null;
}

function countIntegritySha512(text) {
  const sha512 = text.match(/\bintegrity:\s*sha512-/g);
  return sha512 ? sha512.length : 0;
}

function countIntegrityAny(text) {
  const integrities = text.match(/\bintegrity:\s*(sha\d+-|[A-Za-z0-9+/=]+)/g);
  return integrities ? integrities.length : 0;
}

describe('pnpm-lock.yaml sanity', () => {
  const lockPath = path.resolve(process.cwd(), 'pnpm-lock.yaml');
  const text = readLockfile(lockPath);

  it('should exist and be readable', () => {
    expect(fs.existsSync(lockPath)).toBe(true);
    expect(text).toBeTruthy();
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(50);
  });

  it('should include a numeric lockfileVersion', () => {
    const v = extractLockfileVersion(text || '');
    expect(v).toEqual(expect.any(Number));
    expect(v).toBeGreaterThanOrEqual(1);
  });

  it('should not contain insecure http tarball URLs', () => {
    expect(hasOnlyHttpsTarballs(text || '')).toBe(true);
  });

  it('should not leak workspace: or link: protocols in resolved entries', () => {
    const workspaceCount = findProtocols(text || '', 'workspace');
    const linkCount = findProtocols(text || '', 'link');
    // Allow zero by default; if your project intentionally uses these, adapt thresholds here:
    expect(workspaceCount).toBe(0);
    expect(linkCount).toBe(0);
  });

  it('should include integrity fields, preferring sha512 digests', () => {
    const any = countIntegrityAny(text || '');
    const sha512 = countIntegritySha512(text || '');
    expect(any).toBeGreaterThan(0);
    // Prefer majority sha512
    expect(sha512).toBeGreaterThanOrEqual(Math.floor(any * 0.8));
  });

  it('should reference a registry host over HTTPS (npmjs.org or configured mirror)', () => {
    // Accept npmjs.org or a mirror provided via REGISTRY_HOST env
    const registry = process.env.REGISTRY_HOST || 'registry.npmjs.org';
    const re = new RegExp(String.raw`https:\/\/${registry.replace('.', '\\.')}(\/|\b)`, 'i');
    const found = re.test(text || '');
    expect(found).toBe(true);
  });
});

describe('pnpm-lock.yaml failure and parsing edge cases', () => {
  it('returns null when reading a non-existent lockfile path', () => {
    const bogus = path.resolve(process.cwd(), '__no_such__/pnpm-lock.yaml');
    const content = readLockfile(bogus);
    expect(content).toBeNull();
  });

  it('gracefully handles empty content (simulated)', () => {
    // Simulate empty by calling helpers on empty string
    expect(extractLockfileVersion('')).toBeNull();
    expect(hasOnlyHttpsTarballs('')).toBe(true);
    expect(countIntegrityAny('')).toBe(0);
    expect(countIntegritySha512('')).toBe(0);
  });
});
