import { extensionActiveStorage, updateIntervalStorage, countModeStorage } from "@/utils/storage-helpers"
import { normalizeCountMode, normalizeUpdateInterval, type CountMode } from "@/utils/settings-validation"
import { DEFAULT_UPDATE_INTERVAL, MAX_UPDATE_INTERVAL, MIN_UPDATE_INTERVAL } from "@/utils/constants"
import Toggle from "@/components/toggle"
import { i18n } from "#imports"

function App() {
  const [updateInterval, setUpdateInterval] = useState<number>(1000)
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true)
  const [countMode, setCountMode] = useState<CountMode>("words")
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (import.meta.env.DEV) {
    console.log(isExtensionActive, updateInterval, countMode)
  }

  useEffect(() => {
    const unwatchActive = extensionActiveStorage.watch(value => setIsExtensionActive(value))
    const unwatchInterval = updateIntervalStorage.watch(value => setUpdateInterval(normalizeUpdateInterval(value)))
    const unwatchCountMode = countModeStorage.watch(value => setCountMode(normalizeCountMode(value)))

    async function InitActive() {
      try {
        const isActive = await extensionActiveStorage.getValue()
        setIsExtensionActive(isActive)
      } catch (error) {
        setIsExtensionActive(true)
        setSettingsError(i18n.t("popup.loadSettingsFailed"))

        if (import.meta.env.DEV) {
          console.error("Token Counter failed to read active setting:", error)
        }
      }
    }

    async function InitInterval() {
      try {
        const interval = await updateIntervalStorage.getValue()
        setUpdateInterval(normalizeUpdateInterval(interval))
      } catch (error) {
        setUpdateInterval(DEFAULT_UPDATE_INTERVAL)
        setSettingsError(i18n.t("popup.loadSettingsFailed"))

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
        setSettingsError(i18n.t("popup.loadSettingsFailed"))

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

  async function onSaveChanges() {
    setIsSaving(true)
    setSettingsError(null)

    try {
      const safeUpdateInterval = normalizeUpdateInterval(updateInterval)
      const safeCountMode = normalizeCountMode(countMode)

      await Promise.all([
        updateIntervalStorage.setValue(safeUpdateInterval),
        extensionActiveStorage.setValue(isExtensionActive),
        countModeStorage.setValue(safeCountMode),
      ])

      window.close()
    } catch (error) {
      setSettingsError(i18n.t("popup.saveSettingsFailed"))

      if (import.meta.env.DEV) {
        console.error("Token Counter failed to save settings:", error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="flex min-w-[320px] flex-col gap-6 rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-gray-200 p-6 shadow-xl">
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
          min={MIN_UPDATE_INTERVAL}
          max={MAX_UPDATE_INTERVAL}
          step={1}
          value={updateInterval}
          id="update-interval"
          onBlur={e => setUpdateInterval(normalizeUpdateInterval(e.target.value))}
          onChange={e => setUpdateInterval(Number(e.target.value))}
          className="w-28 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-base text-gray-900 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <label htmlFor="count-mode" className="text-base font-medium text-gray-800 select-none">
          {i18n.t("popup.countMode")}
        </label>
        <select
          id="count-mode"
          value={countMode}
          onChange={e => setCountMode(e.target.value as CountMode)}
          className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-base text-gray-900 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          <option value="words">{i18n.t("popup.words")}</option>
          <option value="characters">{i18n.t("popup.characters")}</option>
        </select>
      </div>
      <button
        className="mt-2 w-full cursor-pointer rounded-lg bg-green-500 py-2 font-semibold text-white shadow-md transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:outline-none active:bg-green-700"
        onClick={onSaveChanges}
        disabled={isSaving}
      >
        {isSaving ? i18n.t("popup.saving") : i18n.t("popup.saveChanges")}
      </button>
      {settingsError && <p className="text-sm font-medium text-red-700">{settingsError}</p>}
    </main>
  )
}

export default App
