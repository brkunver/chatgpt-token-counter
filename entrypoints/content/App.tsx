import { useEffect, useState } from "react"
import { pollChatMessages } from "@/utils/pollChatMessages"
import { tokenCounter } from "@/utils/tokenCounter"
import { wordCounter } from "@/utils/wordCounter"

export default function App() {
  const [tokenCount, setTokenCount] = useState(10)
  const [characterCount, setCharacterCount] = useState(10)

  useEffect(() => {
    pollChatMessages((userText, assistantText) => {
      const allText = userText + " " + assistantText
      setTokenCount(tokenCounter(allText))
      setCharacterCount(wordCounter(allText))
    })
  }, [])

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
