import { useEffect, useState } from "react"
import { pollChatMessages } from "@/utils/poll-chat-messages"
import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { extensionActiveStorage, updateIntervalStorage } from "@/utils/storage-helpers"

import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

export default function App() {
  const [tokenCount, setTokenCount] = useState(10)
  const [characterCount, setCharacterCount] = useState(10)
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true)
  const [countInterval, setCountInterval] = useState<number>(DEFAULT_UPDATE_INTERVAL)

  console.log("Dev : ", countInterval)

  useEffect(() => {
    const intervalId = pollChatMessages((userText, assistantText) => {
      const allText = userText + " " + assistantText
      setTokenCount(tokenCounter(allText))
      setCharacterCount(wordCounter(allText))
    }, countInterval)
    return () => {
      clearInterval(intervalId)
    }
  }, [countInterval])

  useEffect(() => {
    extensionActiveStorage.watch(value => setIsExtensionActive(value))
    updateIntervalStorage.watch(value => setCountInterval(value))

    async function InitActive() {
      let isActive = await extensionActiveStorage.getValue()
      setIsExtensionActive(isActive)
    }

    async function InitInterval() {
      let interval = await updateIntervalStorage.getValue()
      setCountInterval(interval)
    }

    InitActive()
    InitInterval()
  }, [])

  if (!isExtensionActive) return null

  // only render on conversation page
  const path = typeof window !== "undefined" ? window.location.pathname : ""
  const isConversationPage = /^\/c\/[\w-]+$/.test(path)
  if (!isConversationPage) return null

  return (
    <div className="font-main fixed top-2 left-1/2 z-[9999] flex w-fit -translate-x-1/2 gap-2 rounded bg-[#121212] p-2 text-sm text-white xl:top-24 xl:right-4 xl:left-auto xl:translate-x-0 xl:flex-col">
      <p className="flex justify-between gap-2">
        <span>{tokenCount}</span>
        <span className="text-gray-400">Tokens</span>
      </p>

      <p className="flex justify-between gap-2">
        <span>{characterCount}</span>
        <span className="text-gray-400">Words</span>
      </p>
    </div>
  )
}
