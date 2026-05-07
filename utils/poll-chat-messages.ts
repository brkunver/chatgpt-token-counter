import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

const USER_MESSAGE_CONTENT_SELECTOR = '[data-testid="collapsible-user-message-content"]'
const ASSISTANT_MESSAGE_CONTENT_SELECTOR = ".markdown"

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
    const messageElements = Array.from(
      document.querySelectorAll('[data-message-author-role="user"], [data-message-author-role="assistant"]'),
    ) as HTMLElement[]

    const messages = messageElements.map(getMessageText).filter(Boolean)
    const signature = messages.join("\n")

    if (signature !== lastSignature) {
      lastSignature = signature
      callback(messages)
    }
  }, interval)
  return id
}
