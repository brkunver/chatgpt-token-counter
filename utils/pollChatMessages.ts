export function pollChatMessages(callback: (userText: string, assistantText: string) => void, interval = 1000) {
  let lastUserText = ""
  let lastAssistantText = ""
  setInterval(() => {
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
}
