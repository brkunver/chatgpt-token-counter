import { useEffect, useState } from "react"
import { pollChatMessages } from "@/utils/poll-chat-messages"
import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { characterCounter } from "@/utils/character-counter"
import { extensionActiveStorage, updateIntervalStorage, countModeStorage, type CountMode } from "@/utils/storage-helpers"

import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

import { i18n } from "#imports"

export default function App() {
  const [tokenCount, setTokenCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true)
  const [countInterval, setCountInterval] = useState<number>(DEFAULT_UPDATE_INTERVAL)
  const [countMode, setCountMode] = useState<CountMode>("words")

  console.log("Dev : Token Counter Rendered")

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      intervalId = pollChatMessages((userText, assistantText) => {
        const allText = userText + " " + assistantText
        setTokenCount(tokenCounter(allText))
        setWordCount(wordCounter(allText))
        setCharCount(characterCounter(allText))
      }, countInterval)
    }

    startPolling()

    return () => {
      clearInterval(intervalId)
    }
  }, [countInterval])

  useEffect(() => {
    extensionActiveStorage.watch(value => setIsExtensionActive(value))
    updateIntervalStorage.watch(value => setCountInterval(value))
    countModeStorage.watch(value => setCountMode(value))

    async function InitActive() {
      let isActive = await extensionActiveStorage.getValue()
      setIsExtensionActive(isActive)
    }

    async function InitInterval() {
      let interval = await updateIntervalStorage.getValue()
      setCountInterval(interval)
    }

    async function InitCountMode() {
      let mode = await countModeStorage.getValue()
      setCountMode(mode)
    }

    InitActive()
    InitInterval()
    InitCountMode()
  }, [])

  if (!isExtensionActive) return null

  return (
    <div
      id="token-counter"
      className="font-main fixed top-2 left-1/2 z-[999999] flex w-fit -translate-x-1/2 gap-2 rounded bg-[#121212] p-2 text-sm text-white xl:top-32 xl:right-4 xl:left-auto xl:translate-x-0 xl:flex-col"
    >
      <p className="flex justify-between gap-2">
        <span>{tokenCount}</span>
        <span className="text-gray-400">{i18n.t("content.tokens")}</span>
      </p>

      <p className="flex justify-between gap-2">
        <span>{countMode === "words" ? wordCount : charCount}</span>
        <span className="text-gray-400">
          {countMode === "words" ? i18n.t("content.words") : i18n.t("content.characters")}
        </span>
      </p>
    </div>
  )
}

