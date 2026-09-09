import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

const USER_CONTENT_SELECTOR = '[data-testid="collapsible-user-message-content"]'
const MESSAGE_SELECTOR = '[data-message-author-role="user"], [data-message-author-role="assistant"]'
const EXCLUDED_SELECTOR = 'button, script, style, svg, [hidden], [aria-hidden="true"]'
const BLOCK_TAGS = new Set(["P", "DIV", "LI", "PRE", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6", "TR"])

export type ChatMessagesHealth = {
  status: "ok" | "waiting" | "warning"
  totalMessageCount: number
  userMessageCount: number
  assistantMessageCount: number
  reason?: "no-messages-found" | "missing-user-content" | "missing-assistant-content"
}

function readText(node: Node): string {
  if (node.nodeType === 3) return node.textContent || ""
  if (!(node instanceof Element) || node.matches(EXCLUDED_SELECTOR)) return ""
  if (node.tagName === "BR") return "\n"

  const text = Array.from(node.childNodes, readText).join("")
  if (node.tagName === "TD" || node.tagName === "TH") return `${text}\t`
  return BLOCK_TAGS.has(node.tagName) ? `\n${text}\n` : text
}

function getMessageText(element: Element) {
  const isUser = element.getAttribute("data-message-author-role") === "user"
  const selector = isUser ? USER_CONTENT_SELECTOR : ".markdown"
  const roots = Array.from(element.querySelectorAll(selector)).filter(root => !root.parentElement?.closest(selector))
  return (roots.length ? roots : [element])
    .map(root => readText(root).trim())
    .filter(Boolean)
    .join("\n")
}

export function collectChatMessages() {
  const elements = Array.from(document.querySelectorAll(MESSAGE_SELECTOR)).filter(
    element => !element.closest('[hidden], [aria-hidden="true"]'),
  )
  const entries = elements.map(element => ({
    role: element.getAttribute("data-message-author-role"),
    text: getMessageText(element),
  }))
  const missing = entries.find(entry => !entry.text)
  const health: ChatMessagesHealth = {
    status: entries.length === 0 ? "waiting" : missing ? "warning" : "ok",
    totalMessageCount: entries.length,
    userMessageCount: entries.filter(entry => entry.role === "user").length,
    assistantMessageCount: entries.filter(entry => entry.role === "assistant").length,
    reason:
      entries.length === 0
        ? "no-messages-found"
        : missing
          ? missing.role === "user"
            ? "missing-user-content"
            : "missing-assistant-content"
          : undefined,
  }
  return { messages: entries.map(entry => entry.text).filter(Boolean), health }
}

export function watchChatMessages(
  callback: (messages: string[], health: ChatMessagesHealth) => void,
  interval = DEFAULT_UPDATE_INTERVAL,
) {
  function poll() {
    const { messages, health } = collectChatMessages()
    callback(messages, health)
  }

  poll()
  const intervalId = setInterval(poll, interval)
  return () => clearInterval(intervalId)
}
