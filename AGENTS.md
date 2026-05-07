# AGENTS.md

## Project Overview

This repository contains a WXT-based browser extension named `chatgpt-token-counter`.
It counts ChatGPT conversation content in real time and displays an overlay on `chatgpt.com`.

The extension currently shows:

- GPT-4o token count for all visible user and assistant messages.
- Either word count or character count, depending on the popup setting.
- A popup UI for enabling/disabling the extension, changing the polling interval, and choosing the secondary count mode.

Published extension links are listed in `README.md`.

## Tech Stack

- WXT for browser extension structure and builds.
- React 19 for content and popup UIs.
- TypeScript.
- Tailwind CSS 4 via `@tailwindcss/vite`.
- `@wxt-dev/i18n` for localization.
- `gpt-tokenizer/model/gpt-4o` for token counting.
- Bun is the package manager, as indicated by `bun.lock` and package scripts.

## Important Commands

Run commands from the repository root.

- `bun install` - install dependencies and run WXT preparation through `postinstall`.
- `bun run dev` - start WXT development mode for Chromium.
- `bun run dev:firefox` - start WXT development mode for Firefox.
- `bun run build` - build the Chromium extension.
- `bun run build:firefox` - build the Firefox extension.
- `bun run zip` - package the Chromium extension.
- `bun run zip:firefox` - package the Firefox extension.
- `bun run build:all` - package both browser targets.
- `bun run compile` - run TypeScript type checking with `tsc --noEmit`.

Before finishing code changes, prefer at least `bun run compile`. For extension packaging or release-related changes, also run the relevant build or zip command.

## Repository Structure

- `entrypoints/content/index.tsx` mounts the content script UI into a WXT shadow root on `*://chatgpt.com/*`.
- `entrypoints/content/App.tsx` renders the on-page counter overlay and watches storage settings.
- `entrypoints/popup/App.tsx` renders the popup settings UI.
- `entrypoints/popup/main.tsx` mounts the popup React app.
- `entrypoints/background.ts` initializes default storage values on first install.
- `utils/poll-chat-messages.ts` polls ChatGPT DOM messages using `data-message-author-role`.
- `utils/token-counter.ts`, `utils/word-counter.ts`, and `utils/character-counter.ts` contain counting helpers.
- `utils/storage-helpers.ts` defines WXT storage items and the `CountMode` type.
- `utils/constants.ts` contains shared constants such as the default polling interval.
- `components/toggle.tsx` contains the reusable popup toggle component.
- `locales/*.yml` contains localized strings used through `i18n.t(...)`.
- `assets/tailwind.css` contains global Tailwind/CSS setup.
- `public/icon/*` and `public/fonts/*` contain extension assets.
- `wxt.config.ts` configures WXT, i18n, React, permissions, and web-accessible font resources.

## Runtime Behavior

The content script only matches `chatgpt.com`.

At mount time, `entrypoints/content/index.tsx`:

- Creates a WXT shadow root UI named `token-counter-shadow-ui`.
- Injects the bundled JetBrains Mono font from `public/fonts/jbmono.ttf`.
- Mounts the React content app after a short delay.

The content app:

- Polls ChatGPT message elements at the configured interval.
- Reads user messages from `[data-message-author-role="user"]`.
- Reads assistant messages from `[data-message-author-role="assistant"]`.
- Concatenates both sets of text and calculates token, word, and character counts.
- Hides itself when `local:extension-active` is false.

The popup app:

- Reads and watches the same WXT storage items as the content app.
- Saves values through storage helpers.
- Closes the popup after saving.

The background script:

- On initial install, sets the extension to active.
- Initializes the update interval with `DEFAULT_UPDATE_INTERVAL`.

## Storage Keys

Storage is centralized in `utils/storage-helpers.ts`.

- `local:extension-active` stores whether the overlay is shown. Fallback: `true`.
- `local:update-interval` stores the polling interval in milliseconds. Fallback: `DEFAULT_UPDATE_INTERVAL`.
- `local:count-mode` stores the secondary count mode. Valid values: `"words"` or `"characters"`. Fallback: `"words"`.

When adding new user-facing settings, define storage items in `utils/storage-helpers.ts` and keep popup/content behavior synchronized.

## Localization

Use `i18n.t(...)` from `#imports` for user-facing strings.

When adding or changing UI text:

- Update `locales/en.yml` first.
- Mirror the key across all locale files in `locales/`.
- Keep key names stable and grouped by UI area, such as `content.*` or `popup.*`.
- Do not hard-code user-facing strings in React components unless they are intentionally not localized.

## Coding Conventions

- Keep TypeScript strictness healthy; run `bun run compile` after code changes.
- Follow the existing formatting style: double quotes, no semicolons, concise functions.
- Prefer WXT APIs imported from `#imports` where the project already uses them.
- Use the `@/` alias for project imports and `~/` where existing WXT asset imports use it.
- Keep extension permissions minimal in `wxt.config.ts`.
- Avoid adding new dependencies unless they clearly reduce complexity.
- Keep DOM selectors for ChatGPT isolated in `utils/poll-chat-messages.ts` where possible.
- Be careful with polling frequency. Low intervals can affect ChatGPT page performance.

## Browser Extension Notes

- Changes under `entrypoints/content/*` affect the injected ChatGPT overlay.
- Changes under `entrypoints/popup/*` affect the browser action popup only.
- Changes under `entrypoints/background.ts` affect install/update lifecycle behavior.
- Changes to `wxt.config.ts`, permissions, matches, icons, fonts, or web-accessible resources can affect store review and runtime compatibility.
- If adding assets that content scripts need to load, ensure they are exposed through `web_accessible_resources`.

## Testing Guidance

There is no dedicated automated test suite in this repository at the time of writing.

For most changes:

1. Run `bun run compile`.
2. Run the relevant WXT dev server or build command.
3. Manually verify the extension on `https://chatgpt.com/`.
4. Check that the popup setting changes propagate to the content overlay.

For DOM-counting changes:

- Verify user and assistant messages are both included.
- Verify counts update when messages stream or new messages are added.
- Verify the overlay disappears when the extension is disabled.
- Watch for ChatGPT DOM changes that may break `data-message-author-role` selectors.

For localization changes:

- Confirm every locale file has the new key.
- Confirm fallback behavior still works through WXT i18n.

## Common Pitfalls

- Do not duplicate storage keys in components; use `utils/storage-helpers.ts`.
- Do not hard-code ChatGPT URLs in multiple places; keep extension match behavior in WXT config or entrypoint definitions.
- Do not forget Firefox builds when changing browser-extension APIs.
- Do not place popup-only UI state in content-script local state if it must persist.
- Do not assume ChatGPT DOM structure is stable. Prefer small, localized selector changes.
- Do not remove shadow-root mounting casually; it protects the overlay from page CSS conflicts.

## Release Notes

The package version is in `package.json`.

When preparing a release:

- Update the version intentionally.
- Run `bun run compile`.
- Run `bun run build` and `bun run build:firefox` or the relevant zip commands.
- Confirm generated artifacts target both Chromium and Firefox if both stores are being updated.
