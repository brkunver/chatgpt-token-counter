export default function App() {
  const [tokenCount, setTokenCount] = useState(10)
  const [characterCount, setCharacterCount] = useState(10)

  return (
    <div className="absolute right-20 bottom-2 z-50 flex w-fit flex-col rounded bg-black p-2 text-white">
      <p>
        Tokens : <span>{tokenCount}</span>
      </p>
      <p>
        Characters : <span>{characterCount}</span>
      </p>
    </div>
  )
}
