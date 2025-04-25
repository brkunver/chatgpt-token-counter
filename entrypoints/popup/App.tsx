import { extensionActiveStorage, updateIntervalStorage } from "@/utils/storage-helpers"

function App() {
  const [updateInterval, setUpdateInterval] = useState<number>(1000)
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true)

  console.log(isExtensionActive, updateInterval)

  useEffect(() => {
    extensionActiveStorage.watch(value => setIsExtensionActive(value))
    updateIntervalStorage.watch(value => setUpdateInterval(value))

    async function InitActive() {
      let isActive = await extensionActiveStorage.getValue()
      setIsExtensionActive(isActive)
    }

    async function InitInterval() {
      let interval = await updateIntervalStorage.getValue()
      setUpdateInterval(interval)
    }

    InitActive()
    InitInterval()
  }, [])

  function onSaveChanges() {
    updateIntervalStorage.setValue(updateInterval)
    extensionActiveStorage.setValue(isExtensionActive)
  }

  return (
    <main className="flex min-w-[300px] flex-col p-4">
      <h1 className="text-2xl font-bold">Chatgpt Token Counter</h1>
      <h2>Settings</h2>
      <div className="flex">
        <label htmlFor="extension-active">Extension Active:</label>
        <input
          type="checkbox"
          id="extension-active"
          checked={isExtensionActive}
          onChange={() => setIsExtensionActive(!isExtensionActive)}
        />
      </div>
      <div className="flex">
        <label htmlFor="update-interval">Update Interval (ms):</label>
        <input
          type="number"
          min={10}
          max={10000}
          step={1}
          value={updateInterval}
          id="update-interval"
          onChange={e => setUpdateInterval(Number(e.target.value))}
        />
      </div>
      <button className="cursor-pointer rounded px-2 py-1" onClick={onSaveChanges}>
        Save Changes
      </button>
    </main>
  )
}

export default App
