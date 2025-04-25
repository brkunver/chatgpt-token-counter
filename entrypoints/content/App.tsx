import { useEffect, useState } from "react"
import { pollChatMessages } from "@/utils/poll-chat-messages"
import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { extensionActiveStorage, updateIntervalStorage } from "@/utils/storage-helpers"

import { DEFAULT_UPDATE_INTERVAL } from "@/constants"

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

  return (
    <div className="fixed top-2 left-1/2 z-[9999] flex w-fit -translate-x-1/2 flex-col gap-2 rounded bg-[#121212] p-2 font-semibold text-white xl:top-24 xl:right-4 xl:left-auto xl:translate-x-0">
      <p className="flex gap-2">
        <span className="text-gray-400">Tokens :</span>
        <span>{tokenCount}</span>
      </p>

      <p className="flex gap-2">
        <span className="text-gray-400">Characters :</span>
        <span>{characterCount}</span>
      </p>
    </div>
  )
}
