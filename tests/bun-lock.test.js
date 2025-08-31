/* 
Test framework: Bun test (bun:test). If the project uses Vitest/Jest already, you can switch the import to:
  import { describe, it, expect } from 'vitest';
or rely on Jest globals.
*/
import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function readLockfile() {
  // Prefer human-readable bun.lock if present, otherwise attempt bun.lockb (binary) and fail with guidance.
  const candidates = ['bun.lock', 'bun-lock.json', 'lock.json', 'bun.lockb'];
  for (const name of candidates) {
    const p = resolve(process.cwd(), name);
    if (existsSync(p)) {
      return { path: p, content: readFileSync(p) };
    }
  }
  throw new Error('Lockfile not found (looked for bun.lock, bun-lock.json, lock.json, bun.lockb). Please add bun.lock to the repo.');
}

function toText(buf) {
  // If binary, toString may contain nulls; we still attempt text search.
  return buf.toString('utf8');
}

/**
 * Utility: assert that every regex in "patterns" matches at least once.
 * Provides helpful diffs for failures.
 */
function expectAllPatterns(text, sectionName, patterns) {
  for (const { re, hint } of patterns) {
    const ok = re.test(text);
    expect(ok, `Failed in ${sectionName}: ${hint || re}`).toBe(true);
  }
}

describe('bun.lock integrity (focused on PR diff areas)', () => {
  const { path: lockPath, content } = readLockfile();
  const text = toText(content);

  it('has lockfileVersion 1', () => {
    expect(/"lockfileVersion"\s*:\s*1\b/.test(text)).toBe(true);
  });

  describe('root workspace metadata', () => {
    it('includes expected name', () => {
      expect(/"workspaces"\s*:\s*{\s*"":\s*{\s*"name"\s*:\s*"ChatGPT Token Counter"/s.test(text)).toBe(true);
    });

    it('declares key dependencies with expected ranges', () => {
      expectAllPatterns(text, 'root dependencies', [
        { re: /"dependencies"\s*:\s*{[^}]*"@wxt-dev\/i18n"\s*:\s*"\^0\.2\.4"/s, hint: '@wxt-dev/i18n ^0.2.4' },
        { re: /"dependencies"[\s\S]*"gpt-tokenizer"\s*:\s*"\^2\.9\.0"/, hint: 'gpt-tokenizer ^2.9.0' },
        { re: /"dependencies"[\s\S]*"react"\s*:\s*"\^19\.1\.1"/, hint: 'react ^19.1.1' },
        { re: /"dependencies"[\s\S]*"react-dom"\s*:\s*"\^19\.1\.1"/, hint: 'react-dom ^19.1.1' },
      ]);
    });

    it('declares key devDependencies with expected ranges', () => {
      expectAllPatterns(text, 'root devDependencies', [
        { re: /"devDependencies"\s*:\s*{[^}]*"@tailwindcss\/vite"\s*:\s*"\^4\.1\.12"/s, hint: '@tailwindcss/vite ^4.1.12' },
        { re: /"devDependencies"[\s\S]*"@types\/react"\s*:\s*"\^19\.1\.10"/, hint: '@types/react ^19.1.10' },
        { re: /"devDependencies"[\s\S]*"@types\/react-dom"\s*:\s*"\^19\.1\.7"/, hint: '@types/react-dom ^19.1.7' },
        { re: /"devDependencies"[\s\S]*"@wxt-dev\/module-react"\s*:\s*"\^1\.1\.3"/, hint: '@wxt-dev/module-react ^1.1.3' },
        { re: /"devDependencies"[\s\S]*"prettier"\s*:\s*"\^3\.6\.2"/, hint: 'prettier ^3.6.2' },
        { re: /"devDependencies"[\s\S]*"prettier-plugin-tailwindcss"\s*:\s*"\^0\.6\.14"/, hint: 'prettier-plugin-tailwindcss ^0.6.14' },
        { re: /"devDependencies"[\s\S]*"tailwindcss"\s*:\s*"\^4\.1\.12"/, hint: 'tailwindcss ^4.1.12' },
        { re: /"devDependencies"[\s\S]*"typescript"\s*:\s*"\^5\.9\.2"/, hint: 'typescript ^5.9.2' },
        { re: /"devDependencies"[\s\S]*"wxt"\s*:\s*"\^0\.20\.8"/, hint: 'wxt ^0.20.8' },
      ]);
    });
  });

  it('lists trustedDependencies entries', () => {
    expectAllPatterns(text, 'trustedDependencies', [
      { re: /"trustedDependencies"\s*:\s*\[[^\]]*"@tailwindcss\/oxide"[^\]]*\]/s, hint: 'trustedDependencies: @tailwindcss/oxide' },
      { re: /"trustedDependencies"[\s\S]*"spawn-sync"/, hint: 'trustedDependencies: spawn-sync' },
    ]);
  });

  describe('package resolution entries (versions and deps)', () => {
    it('@tailwindcss/node@4.1.12 with expected deps', () => {
      expectAllPatterns(text, '@tailwindcss/node', [
        { re: /"@tailwindcss\/node"\s*:\s*\[\s*"@tailwindcss\/node@4\.1\.12"/, hint: 'version 4.1.12' },
        { re: /"dependencies"\s*:\s*{[^}]*"@jridgewell\/remapping"\s*:\s*"\^2\.3\.4"/s, hint: '@jridgewell/remapping ^2.3.4' },
        { re: /"dependencies"[\s\S]*"enhanced-resolve"\s*:\s*"\^5\.18\.3"/, hint: 'enhanced-resolve ^5.18.3' },
        { re: /"dependencies"[\s\S]*"jiti"\s*:\s*"\^2\.5\.1"/, hint: 'jiti ^2.5.1' },
        { re: /"dependencies"[\s\S]*"lightningcss"\s*:\s*"1\.30\.1"/, hint: 'lightningcss 1.30.1' },
        { re: /"dependencies"[\s\S]*"magic-string"\s*:\s*"\^0\.30\.17"/, hint: 'magic-string ^0.30.17' },
        { re: /"dependencies"[\s\S]*"source-map-js"\s*:\s*"\^1\.2\.1"/, hint: 'source-map-js ^1.2.1' },
        { re: /"dependencies"[\s\S]*"tailwindcss"\s*:\s*"4\.1\.12"/, hint: 'tailwindcss 4.1.12' },
      ]);
    });

    it('@tailwindcss/oxide@4.1.12 with optional deps per platform', () => {
      expectAllPatterns(text, '@tailwindcss/oxide', [
        { re: /"@tailwindcss\/oxide"\s*:\s*\[\s*"@tailwindcss\/oxide@4\.1\.12"/, hint: 'version 4.1.12' },
        { re: /"dependencies"\s*:\s*{[^}]*"detect-libc"\s*:\s*"\^2\.0\.4"/s, hint: 'detect-libc ^2.0.4' },
        { re: /"dependencies"[\s\S]*"tar"\s*:\s*"\^7\.4\.3"/, hint: 'tar ^7.4.3' },
        { re: /"optionalDependencies"[\s\S]*"@tailwindcss\/oxide-darwin-x64"\s*:\s*"4\.1\.12"/, hint: 'optional platform binary darwin-x64' },
        { re: /"optionalDependencies"[\s\S]*"@tailwindcss\/oxide-linux-x64-gnu"\s*:\s*"4\.1\.12"/, hint: 'optional platform binary linux-x64-gnu' },
        { re: /"optionalDependencies"[\s\S]*"@tailwindcss\/oxide-win32-x64-msvc"\s*:\s*"4\.1\.12"/, hint: 'optional platform binary win32-x64-msvc' },
      ]);
    });

    it('@tailwindcss/vite@4.1.12 peers and deps', () => {
      expectAllPatterns(text, '@tailwindcss/vite', [
        { re: /"@tailwindcss\/vite"\s*:\s*\[\s*"@tailwindcss\/vite@4\.1\.12"/, hint: 'version 4.1.12' },
        { re: /"dependencies"[\s\S]*"@tailwindcss\/node"\s*:\s*"4\.1\.12"/, hint: 'dep @tailwindcss/node 4.1.12' },
        { re: /"dependencies"[\s\S]*"@tailwindcss\/oxide"\s*:\s*"4\.1\.12"/, hint: 'dep @tailwindcss/oxide 4.1.12' },
        { re: /"dependencies"[\s\S]*"tailwindcss"\s*:\s*"4\.1\.12"/, hint: 'dep tailwindcss 4.1.12' },
        { re: /"peerDependencies"[\s\S]*"vite"\s*:\s*"\^5\.2\.0\s*\|\|\s*\^6\s*\|\|\s*\^7"/, hint: 'peer vite ^5.2.0 || ^6 || ^7' },
      ]);
    });

    it('@wxt-dev packages', () => {
      expectAllPatterns(text, '@wxt-dev/i18n & module-react', [
        { re: /"@wxt-dev\/i18n"\s*:\s*\[\s*"@wxt-dev\/i18n@0\.2\.4"/, hint: '@wxt-dev/i18n 0.2.4' },
        { re: /"peerDependencies"[\s\S]*"wxt"\s*:\s*">=0\.19\.7"/, hint: '@wxt-dev/i18n peer wxt >=0.19.7' },
        { re: /"@wxt-dev\/module-react"\s*:\s*\[\s*"@wxt-dev\/module-react@1\.1\.3"/, hint: '@wxt-dev/module-react 1.1.3' },
        { re: /"peerDependencies"[\s\S]*"wxt"\s*:\s*">=0\.19\.16"/, hint: '@wxt-dev/module-react peer wxt >=0.19.16' },
      ]);
    });

    it('gpt-tokenizer pinned at 2.9.0', () => {
      expect(/"gpt-tokenizer"\s*:\s*\[\s*"gpt-tokenizer@2\.9\.0"/.test(text)).toBe(true);
    });

    it('prettier pinned at 3.6.2 with bin', () => {
      expectAllPatterns(text, 'prettier', [
        { re: /"prettier"\s*:\s*\[\s*"prettier@3\.6\.2"/, hint: 'prettier 3.6.2' },
        { re: /"bin"\s*:\s*{[^}]*"prettier"\s*:\s*"bin\/prettier\.cjs"/s, hint: 'prettier bin entry' },
      ]);
    });

    it('rc package with expected dependencies and bin', () => {
      expectAllPatterns(text, 'rc', [
        { re: /"rc"\s*:\s*\[\s*"rc@1\.2\.8"/, hint: 'rc 1.2.8' },
        { re: /"dependencies"[\s\S]*"deep-extend"\s*:\s*"\^0\.6\.0"/, hint: 'deep-extend ^0.6.0' },
        { re: /"dependencies"[\s\S]*"ini"\s*:\s*"~1\.3\.0"/, hint: 'ini ~1.3.0' },
        { re: /"dependencies"[\s\S]*"minimist"\s*:\s*"\^1\.2\.0"/, hint: 'minimist ^1.2.0' },
        { re: /"dependencies"[\s\S]*"strip-json-comments"\s*:\s*"~2\.0\.1"/, hint: 'strip-json-comments ~2.0.1' },
        { re: /"bin"\s*:\s*{[^}]*"rc"\s*:\s*"\.\/cli\.js"/s, hint: 'bin rc ./cli.js' },
      ]);
    });

    it('react 19.1.1 and react-dom 19.1.1 with scheduler peer', () => {
      expectAllPatterns(text, 'react & react-dom', [
        { re: /"react"\s*:\s*\[\s*"react@19\.1\.1"/, hint: 'react 19.1.1' },
        { re: /"react-dom"\s*:\s*\[\s*"react-dom@19\.1\.1"/, hint: 'react-dom 19.1.1' },
        { re: /"react-dom"[\s\S]*"dependencies"[\s\S]*"scheduler"\s*:\s*"\^0\.26\.0"/, hint: 'react-dom dep scheduler ^0.26.0' },
        { re: /"react-dom"[\s\S]*"peerDependencies"[\s\S]*"react"\s*:\s*"\^19\.1\.1"/, hint: 'react-dom peer react ^19.1.1' },
      ]);
    });

    it('tailwindcss 4.1.12 exists', () => {
      expect(/"tailwindcss"\s*:\s*\[\s*"tailwindcss@4\.1\.12"/.test(text)).toBe(true);
    });

    it('typescript 5.9.2 with bin entries', () => {
      expectAllPatterns(text, 'typescript', [
        { re: /"typescript"\s*:\s*\[\s*"typescript@5\.9\.2"/, hint: 'TypeScript 5.9.2' },
        { re: /"bin"\s*:\s*{[^}]*"tsc"\s*:\s*"bin\/tsc"/s, hint: 'bin tsc' },
        { re: /"bin"[\s\S]*"tsserver"\s*:\s*"bin\/tsserver"/, hint: 'bin tsserver' },
      ]);
    });

    it('vite 7.1.3 with dependencies and peers', () => {
      expectAllPatterns(text, 'vite', [
        { re: /"vite"\s*:\s*\[\s*"vite@7\.1\.3"/, hint: 'vite 7.1.3' },
        { re: /"dependencies"[\s\S]*"esbuild"\s*:\s*"\^0\.25\.0"/, hint: 'dep esbuild ^0.25.0' },
        { re: /"dependencies"[\s\S]*"rollup"\s*:\s*"\^4\.43\.0"/, hint: 'dep rollup ^4.43.0' },
        { re: /"peerDependencies"[\s\S]*"@types\/node"\s*:\s*"\^20\.19\.0\s*\|\|\s*>=22\.12\.0"/, hint: 'peer @types/node' },
        { re: /"optionalDependencies"[\s\S]*"fsevents"\s*:\s*"~2\.3\.3"/, hint: 'optional fsevents ~2.3.3' },
        { re: /"bin"\s*:\s*{[^}]*"vite"\s*:\s*"bin\/vite\.js"/s, hint: 'bin vite' },
      ]);
    });

    it('wxt 0.20.8 present with expected bins', () => {
      expectAllPatterns(text, 'wxt', [
        { re: /"wxt"\s*:\s*\[\s*"wxt@0\.20\.8"/, hint: 'wxt 0.20.8' },
        { re: /"bin"\s*:\s*{[^}]*"wxt"\s*:\s*"bin\/wxt\.mjs"/s, hint: 'bin wxt' },
        { re: /"bin"[\s\S]*"wxt-publish-extension"\s*:\s*"bin\/wxt-publish-extension\.cjs"/, hint: 'bin wxt-publish-extension' },
      ]);
    });
  });

  describe('edge cases and invariants', () => {
    it('does not contain obvious unresolved merge markers', () => {
      expect(/<{7}|>{7}|\|{7}/.test(text)).toBe(false);
    });

    it('contains at least one sha512 integrity field', () => {
      expect(/"sha512-[A-Za-z0-9+/=]+"/.test(text)).toBe(true);
    });

    it('trustedDependencies array syntax remains valid (opening and closing brackets present)', () => {
      expect(/\n\s*"trustedDependencies"\s*:\s*\[[\s\S]*?\],/.test(text)).toBe(true);
    });
  });
});