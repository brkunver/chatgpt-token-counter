import { storage } from "#imports"

let extensionActiveStorage = storage.defineItem<boolean>("local:extension-active", {
  fallback: true,
})

let updateIntervalStorage = storage.defineItem<number>("local:update-interval", {
  fallback: 1000,
})

export { extensionActiveStorage, updateIntervalStorage }
