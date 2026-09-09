import { afterEach, describe, expect, it, vi } from "vitest"
import { parseHTML } from "linkedom"
import { collectChatMessages, watchChatMessages } from "@/utils/poll-chat-messages"

function setPage(html: string) {
  const { document, Element } = parseHTML(`<html><body>${html}</body></html>`)
  vi.stubGlobal("document", document)
  vi.stubGlobal("Element", Element)
  return document
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("chat extraction and polling", () => {
  it("preserves paragraph boundaries and reads all markdown blocks once", () => {
    setPage(`<div data-message-author-role="assistant">
      <div class="markdown"><p>Hello</p><p>world</p><div class="markdown">nested</div></div>
      <div class="markdown"><pre><code>a\nb</code><button>Copy</button></pre></div>
    </div>`)
    const { messages, health } = collectChatMessages()
    expect(messages[0]).toContain("Hello\n\nworld")
    expect(messages[0]).toContain("a\nb")
    expect(messages[0]).not.toContain("Copy")
    expect(messages[0]?.match(/nested/g)).toHaveLength(1)
    expect(health.status).toBe("ok")
  })

  it("falls back to user text without including controls", () => {
    setPage('<div data-message-author-role="user"><p>Question</p><button>Edit</button></div>')
    expect(collectChatMessages().messages).toEqual(["Question"])
  })

  it("warns about unreadable user content even when assistant content is present", () => {
    setPage(
      '<div data-message-author-role="user"><button>Edit</button></div><div data-message-author-role="assistant"><div class="markdown">Answer</div></div>',
    )
    expect(collectChatMessages().health).toMatchObject({ status: "warning", reason: "missing-user-content" })
  })

  it("skips explicitly hidden messages", () => {
    setPage('<div hidden><div data-message-author-role="user">Old branch</div></div>')
    expect(collectChatMessages().messages).toEqual([])
  })

  it("keeps an empty conversation in waiting state", () => {
    setPage("")
    vi.useFakeTimers()
    const callback = vi.fn()
    const stop = watchChatMessages(callback, 500)
    vi.advanceTimersByTime(10000)
    expect(callback.mock.calls.every(call => call[1].status === "waiting")).toBe(true)
    stop()
  })

  it("respects the interval, updates streamed text, clears a new conversation, and stops", () => {
    const document = setPage('<div data-message-author-role="user">Hello</div>')
    vi.useFakeTimers()
    const callback = vi.fn()
    const stop = watchChatMessages(callback, 10000)
    document.body.innerHTML += '<div data-message-author-role="assistant">Streaming</div>'
    vi.advanceTimersByTime(9999)
    expect(callback).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(callback.mock.lastCall?.[0]).toEqual(["Hello", "Streaming"])
    document.body.innerHTML = ""
    vi.advanceTimersByTime(10000)
    expect(callback.mock.lastCall?.[0]).toEqual([])
    stop()
    vi.advanceTimersByTime(10000)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(vi.getTimerCount()).toBe(0)
  })
})
