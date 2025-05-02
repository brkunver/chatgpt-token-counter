import { storage } from "#imports"
import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

let extensionActiveStorage = storage.defineItem<boolean>("local:extension-active", {
  fallback: true,
})

let updateIntervalStorage = storage.defineItem<number>("local:update-interval", {
  fallback: DEFAULT_UPDATE_INTERVAL,
})

export { extensionActiveStorage, updateIntervalStorage }
