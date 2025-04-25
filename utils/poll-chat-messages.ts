import { DEFAULT_UPDATE_INTERVAL } from "@/constants"

export function pollChatMessages(
  callback: (userText: string, assistantText: string) => void,
  interval = DEFAULT_UPDATE_INTERVAL,
) {
  let lastUserText = ""
  let lastAssistantText = ""
  const id = setInterval(() => {
    const userMessages = Array.from(document.querySelectorAll('[data-message-author-role="user"]')) as HTMLElement[]
    const assistantMessages = Array.from(
      document.querySelectorAll('[data-message-author-role="assistant"]'),
    ) as HTMLElement[]
    const userText = userMessages.map(el => el.textContent || "").join(" ")
    const assistantText = assistantMessages.map(el => el.textContent || "").join(" ")
    if (userText !== lastUserText || assistantText !== lastAssistantText) {
      lastUserText = userText
      lastAssistantText = assistantText
      callback(userText, assistantText)
    }
  }, interval)
  return id
}
