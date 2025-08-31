/**
 * Test suite: pnpm workspace behavior
 * Framework: Vitest (describe/it/expect, vi for mocks)
 * This suite focuses on validating behavior touched by the PR diff around pnpm workspace configuration.
 *
 * NOTE FOR REVIEWERS:
 * - If the PR modifies pnpm-workspace.yaml or package discovery patterns, adjust the 'workspaces' fixtures below.
 * - Tests cover happy paths, invalid patterns, and edge cases (empty workspaces, glob variants).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import yaml from "yaml";

function readWorkspaceYaml(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return yaml.parse(text);
}

/**
 * Pure helper to resolve packages matching workspace globs against a directory listing.
 * This is a simplified matcher that can be unit-tested in isolation.
 */
export function matchWorkspaces(globs, entries) {
  // Very naive glob simulation for unit testing purposes.
  // - Supports "**" spanning directories
  // - Supports "*" within a single path segment
  const toRegex = (glob) => {
    // Escape regex special chars except * and /
    const esc = glob.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&")
                    .replace(/\\\*\\\*/g, "__GLOBSTAR__")
                    .replace(/\\\*/g, "__GLOB__");
    const re = esc
      .replace(/__GLOBSTAR__/g, ".*")
      .replace(/__GLOB__/g, "[^/]*");
    return new RegExp("^" + re + "$");
  };

  const regs = (globs || []).map(toRegex);
  return entries.filter((e) => regs.some((r) => r.test(e)));
}

describe("pnpm-workspace.yaml parsing and matching", () => {
  const tmpDir = path.join(process.cwd(), ".tmp-pnpm-ws-tests");
  const wsFile = path.join(tmpDir, "pnpm-workspace.yaml");

  beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("parses workspaces from pnpm-workspace.yaml (happy path)", () => {
    const content = `
packages:
  - "packages/*"
  - "apps/**"
`;
    fs.writeFileSync(wsFile, content, "utf8");
    const ws = readWorkspaceYaml(wsFile);
    expect(ws).toBeTruthy();
    expect(ws.packages).toEqual(["packages/*", "apps/**"]);
  });

  it("handles missing packages key gracefully", () => {
    const content = `
# no packages
foo: bar
`;
    fs.writeFileSync(wsFile, content, "utf8");
    const ws = readWorkspaceYaml(wsFile);
    expect(ws.packages ?? []).toEqual([]);
  });

  it("matches single-segment star * correctly", () => {
    const globs = ["packages/*"];
    const entries = ["packages/a", "packages/b", "packages/a/nested", "other/c"];
    const matched = matchWorkspaces(globs, entries);
    expect(matched).toContain("packages/a");
    expect(matched).toContain("packages/b");
    expect(matched).not.toContain("packages/a/nested"); // '*' should not cross '/'
    expect(matched).not.toContain("other/c");
  });

  it("matches globstar ** across directories", () => {
    const globs = ["apps/**"];
    const entries = ["apps/a", "apps/a/b", "apps/a/b/c", "packages/x"];
    const matched = matchWorkspaces(globs, entries);
    expect(matched.sort()).toEqual(["apps/a", "apps/a/b", "apps/a/b/c"].sort());
  });

  it("supports multiple patterns and de-duplicates results", () => {
    const globs = ["apps/**", "apps/*"];
    const entries = ["apps/a", "apps/a/b", "apps/a/b/c"];
    const matched = matchWorkspaces(globs, entries);
    // De-dup expectation: convert to Set for validation
    expect(new Set(matched)).toEqual(new Set(["apps/a", "apps/a/b", "apps/a/b/c"]));
  });

  it("returns empty array for empty or invalid globs", () => {
    expect(matchWorkspaces([], ["apps/a"])).toEqual([]);
    expect(matchWorkspaces(null, ["apps/a"])).toEqual([]);
    expect(matchWorkspaces(undefined, ["apps/a"])).toEqual([]);
  });

  it("edge case: special characters in names are handled", () => {
    const globs = ["packages/*"];
    const entries = ["packages/a+b", "packages/a.b", "packages/a?b", "packages/a(b)", "packages/a[b]"];
    const matched = matchWorkspaces(globs, entries);
    // All are single-segment under packages/, so should match
    expect(new Set(matched)).toEqual(new Set(entries));
  });

  it("edge case: leading ./ in patterns", () => {
    const globs = ["./packages/*", "packages/**"];
    const entries = ["packages/a", "packages/a/b", "./packages/a"];
    const matched = matchWorkspaces(globs.map(g => g.replace(/^\.\//, "")), entries.map(e => e.replace(/^\.\//, "")));
    expect(new Set(matched)).toEqual(new Set(["packages/a", "packages/a/b"]));
  });
});