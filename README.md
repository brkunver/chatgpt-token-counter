# chatgpt token counter

Count tokens in real time on chatgpt conversation.

Chrome Store : https://chromewebstore.google.com/detail/fjlalaedpfcojcfpkgkglbjjbbkofgnl?utm_source=item-share-cb
Firefox Addon Store : https://addons.mozilla.org/en-US/firefox/addon/chatgpt-token-counter/

## Features

- Count tokens in real time on chatgpt conversation.
- Display the token count on the screen.

## Counting scope

Counts are estimates of loaded user and assistant message text using the GPT-5 tokenizer, not total model usage. Attachments, images, hidden instructions, and messages absent from the page DOM are not included. Rendered text differs from raw Markdown.

Each message is counted separately. Unchanged message counts are cached, and removed messages are dropped from the cache. Block boundaries are retained as newlines. Word counts use Unicode word segmentation; character counts use grapheme clusters (including combined emoji). No artificial separator is counted between separate messages.

Disabling the extension stops polling and counting. The update interval (100–10,000 ms) controls a single timer; page mutations do not bypass it. Empty conversations show zero without an accuracy warning. Unreadable message content produces a warning, while calculation failures hide stale values and retry at the next interval.

## Development

Requires Bun. Run `bun install`, then `bun run dev`.

- `bun run compile`: type checking
- `bun run test`: regression checks
- `bun run build` / `bun run build:firefox`: production builds
- `bun run zip:all`: package both browsers

For manual verification, load `.output/chrome-mv3` as an unpacked extension in Chrome, then refresh ChatGPT. Check a blank conversation, multiline/code messages, special-token text such as `<|endoftext|>`, streaming replies, switching conversations, and popup settings (including disabling/re-enabling and a 10-second update interval).
