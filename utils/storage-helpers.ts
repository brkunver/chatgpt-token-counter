import { storage } from "#imports"
import { DEFAULT_UPDATE_INTERVAL } from "@/utils/constants"

export type CountMode = "words" | "characters"

let extensionActiveStorage = storage.defineItem<boolean>("local:extension-active", {
  fallback: true,
})

let updateIntervalStorage = storage.defineItem<number>("local:update-interval", {
  fallback: DEFAULT_UPDATE_INTERVAL,
})

let countModeStorage = storage.defineItem<CountMode>("local:count-mode", {
  fallback: "words",
})

export { extensionActiveStorage, updateIntervalStorage, countModeStorage }
