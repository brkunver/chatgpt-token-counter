import { extensionActiveStorage, updateIntervalStorage } from "@/utils/storage-helpers"
import Toggle from "@/components/toggle"
import { i18n } from "#imports"

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
    window.close()
  }

  return (
    <main className="flex min-w-[320px] flex-col gap-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-200 p-6 shadow-xl">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-gray-900">{i18n.t("extName")}</h1>
      <h2 className="mb-4 text-center text-lg font-semibold text-gray-700">{i18n.t("popup.settings")}</h2>
      <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <Toggle checked={isExtensionActive} onChange={setIsExtensionActive} id="extension-active" />
        <label htmlFor="extension-active" className="text-base font-medium text-gray-800 select-none">
          {i18n.t("popup.extensionStatus")}
        </label>
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <label htmlFor="update-interval" className="text-base font-medium text-gray-800 select-none">
          {i18n.t("popup.updateInterval")}
        </label>
        <input
          type="number"
          min={10}
          max={10000}
          step={1}
          value={updateInterval}
          id="update-interval"
          onChange={e => setUpdateInterval(Number(e.target.value))}
          className="w-28 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-base text-gray-900 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>
      <button
        className="mt-2 w-full cursor-pointer rounded-lg bg-green-500 py-2 font-semibold text-white shadow-md transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:outline-none active:bg-green-700"
        onClick={onSaveChanges}
      >
        {i18n.t("popup.saveChanges")}
      </button>
    </main>
  )
}

export default App
