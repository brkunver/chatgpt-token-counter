import { useEffect, useState } from "react"
import { watchChatMessages, type ChatMessagesHealth } from "@/utils/poll-chat-messages"
import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { characterCounter } from "@/utils/character-counter"
import { extensionActiveStorage, updateIntervalStorage, countModeStorage } from "@/utils/storage-helpers"
import { normalizeCountMode, normalizeUpdateInterval, type CountMode } from "@/utils/settings-validation"

import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

import { i18n } from "#imports"

export default function App() {
  const [tokenCount, setTokenCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true)
  const [countInterval, setCountInterval] = useState<number>(DEFAULT_UPDATE_INTERVAL)
  const [countMode, setCountMode] = useState<CountMode>("words")
  const [counterIssue, setCounterIssue] = useState<"warning" | "error" | null>(null)

  if (import.meta.env.DEV) {
    console.log("Dev : Token Counter Rendered")
  }

  useEffect(() => {
    function handleHealthChange(health: ChatMessagesHealth) {
      if (health.status === "warning") {
        setCounterIssue(currentIssue => (currentIssue === "error" ? currentIssue : "warning"))
        return
      }

      setCounterIssue(currentIssue => (currentIssue === "warning" ? null : currentIssue))
    }

    const stopPolling = watchChatMessages(
      messages => {
        const conversationText = messages.join("\n")

        try {
          setTokenCount(tokenCounter(conversationText))
          setWordCount(wordCounter(conversationText))
          setCharCount(characterCounter(conversationText))
          setCounterIssue(null)
        } catch (error) {
          setCounterIssue("error")

          if (import.meta.env.DEV) {
            console.error("Token Counter failed to update counts:", error)
          }
        }
      },
      countInterval,
      { onHealthChange: handleHealthChange },
    )

    return () => {
      stopPolling()
    }
  }, [countInterval])

  useEffect(() => {
    const unwatchActive = extensionActiveStorage.watch(value => setIsExtensionActive(value))
    const unwatchInterval = updateIntervalStorage.watch(value => setCountInterval(normalizeUpdateInterval(value)))
    const unwatchCountMode = countModeStorage.watch(value => setCountMode(normalizeCountMode(value)))

    async function InitActive() {
      try {
        const isActive = await extensionActiveStorage.getValue()
        setIsExtensionActive(isActive)
      } catch (error) {
        setIsExtensionActive(true)

        if (import.meta.env.DEV) {
          console.error("Token Counter failed to read active setting:", error)
        }
      }
    }

    async function InitInterval() {
      try {
        const interval = await updateIntervalStorage.getValue()
        setCountInterval(normalizeUpdateInterval(interval))
      } catch (error) {
        setCountInterval(DEFAULT_UPDATE_INTERVAL)

        if (import.meta.env.DEV) {
          console.error("Token Counter failed to read interval setting:", error)
        }
      }
    }

    async function InitCountMode() {
      try {
        const mode = await countModeStorage.getValue()
        setCountMode(normalizeCountMode(mode))
      } catch (error) {
        setCountMode("words")

        if (import.meta.env.DEV) {
          console.error("Token Counter failed to read count mode setting:", error)
        }
      }
    }

    InitActive()
    InitInterval()
    InitCountMode()

    return () => {
      unwatchActive()
      unwatchInterval()
      unwatchCountMode()
    }
  }, [])

  if (!isExtensionActive) return null

  return (
    <div
      id="token-counter"
      className="font-main fixed top-2 left-1/2 z-999999 flex w-fit -translate-x-1/2 gap-2 rounded bg-[#121212] p-2 text-sm text-white xl:top-32 xl:right-4 xl:left-auto xl:translate-x-0 xl:flex-col"
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

      {counterIssue && (
        <p
          className={
            "basis-full text-xs xl:max-w-32 " + (counterIssue === "error" ? "text-red-300" : "text-yellow-300")
          }
        >
          {counterIssue === "error" ? i18n.t("content.counterPaused") : i18n.t("content.counterMayBeInaccurate")}
        </p>
      )}
    </div>
  )
}
