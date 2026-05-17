import { defineConfig } from "wxt"
import Tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      if (wxt.config.mode !== "development") return

      manifest.name = `DEV | ${manifest.name}`

      if (manifest.action?.default_title) {
        manifest.action.default_title = `DEV | ${manifest.action.default_title}`
      }
    },
  },
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["storage"],
    browser_specific_settings: {
      gecko: {
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
    web_accessible_resources: [{ resources: ["fonts/*"], matches: ["*://chatgpt.com/*"] }],
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
})
