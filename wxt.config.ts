import { defineConfig } from "wxt"
import Tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["storage"],
    web_accessible_resources: [{ resources: ["fonts/*"], matches: ["*://chatgpt.com/*"] }],
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
})
