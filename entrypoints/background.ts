import { extensionActiveStorage, updateIntervalStorage } from "@/utils/storage-helpers"
import { DEFAULT_UPDATE_INTERVAL } from "@/constants"

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
      extensionActiveStorage
        .setValue(true)
        .then(() => {
          console.log("Extension activated")
        })
        .catch(error => {
          console.error("Failed to activate extension:", error)
        })

      updateIntervalStorage
        .setValue(DEFAULT_UPDATE_INTERVAL)
        .then(() => {
          console.log("Update interval set to ", DEFAULT_UPDATE_INTERVAL)
        })
        .catch(error => {
          console.error("Failed to set update interval:", error)
        })
    }
  })
})
