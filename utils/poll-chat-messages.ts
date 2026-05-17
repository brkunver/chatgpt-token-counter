import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

const USER_MESSAGE_CONTENT_SELECTOR = '[data-testid="collapsible-user-message-content"]'
const ASSISTANT_MESSAGE_CONTENT_SELECTOR = ".markdown"
const MESSAGE_SELECTOR = '[data-message-author-role="user"], [data-message-author-role="assistant"]'
const EMPTY_POLL_WARNING_THRESHOLD = 8

export type ChatMessagesHealth = {
  status: "ok" | "waiting" | "warning"
  totalMessageCount: number
  userMessageCount: number
  assistantMessageCount: number
  reason?: "no-messages-found" | "missing-user-content" | "missing-assistant-content"
}

type PollChatMessagesOptions = {
  onHealthChange?: (health: ChatMessagesHealth) => void
}

function collectChatMessages() {
  const messageElements = Array.from(document.querySelectorAll(MESSAGE_SELECTOR)) as HTMLElement[]
  const messages = messageElements.map(getMessageText).filter(Boolean)
  const userMessageCount = messageElements.filter(
    element => element.getAttribute("data-message-author-role") === "user",
  ).length
  const assistantMessageCount = messageElements.filter(
    element => element.getAttribute("data-message-author-role") === "assistant",
  ).length

  return {
    messageElements,
    messages,
    userMessageCount,
    assistantMessageCount,
  }
}

function getMessageText(element: HTMLElement): string {
  const role = element.getAttribute("data-message-author-role")

  if (role === "user") {
    return element.querySelector(USER_MESSAGE_CONTENT_SELECTOR)?.textContent || ""
  }

  if (role === "assistant") {
    return element.querySelector(ASSISTANT_MESSAGE_CONTENT_SELECTOR)?.textContent || element.textContent || ""
  }

  return element.textContent || ""
}

export function pollChatMessages(callback: (messages: string[]) => void, interval = DEFAULT_UPDATE_INTERVAL) {
  let lastSignature = ""
  const id = setInterval(() => {
    const { messages } = collectChatMessages()
    const signature = messages.join("\n")

    if (signature !== lastSignature) {
      lastSignature = signature
      callback(messages)
    }
  }, interval)

  return id
}

export function watchChatMessages(
  callback: (messages: string[]) => void,
  interval = DEFAULT_UPDATE_INTERVAL,
  options: PollChatMessagesOptions = {},
) {
  let lastSignature = ""
  let lastHealthSignature = ""
  let emptyPollCount = 0
  let isStopped = false
  let scheduledPollId: number | null = null

  function emitHealth(health: ChatMessagesHealth) {
    const signature = JSON.stringify(health)

    if (signature !== lastHealthSignature) {
      lastHealthSignature = signature
      options.onHealthChange?.(health)
    }
  }

  function poll() {
    if (isStopped) return

    const { messageElements, messages, userMessageCount, assistantMessageCount } = collectChatMessages()
    const signature = messages.join("\n")

    if (messageElements.length === 0) {
      emptyPollCount += 1
      emitHealth({
        status: emptyPollCount >= EMPTY_POLL_WARNING_THRESHOLD ? "warning" : "waiting",
        totalMessageCount: 0,
        userMessageCount: 0,
        assistantMessageCount: 0,
        reason: "no-messages-found",
      })
    } else {
      emptyPollCount = 0
      emitHealth({
        status:
          userMessageCount > 0 && messages.length === 0
            ? "warning"
            : assistantMessageCount > 0 && messages.length === 0
              ? "warning"
              : "ok",
        totalMessageCount: messageElements.length,
        userMessageCount,
        assistantMessageCount,
        reason:
          userMessageCount > 0 && messages.length === 0
            ? "missing-user-content"
            : assistantMessageCount > 0 && messages.length === 0
              ? "missing-assistant-content"
              : undefined,
      })
    }

    if (signature !== lastSignature) {
      lastSignature = signature
      callback(messages)
    }
  }

  const intervalId = setInterval(poll, interval)
  function schedulePoll() {
    if (scheduledPollId !== null) return

    scheduledPollId = window.setTimeout(
      () => {
        scheduledPollId = null
        poll()
      },
      Math.min(interval, 100),
    )
  }

  const observer = new MutationObserver(schedulePoll)

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  poll()

  return () => {
    isStopped = true
    clearInterval(intervalId)
    if (scheduledPollId !== null) {
      clearTimeout(scheduledPollId)
    }
    observer.disconnect()
  }
}
