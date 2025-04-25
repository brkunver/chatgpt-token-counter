import { defineConfig } from "wxt"
import Tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
    web_accessible_resources: [{ resources: ["fonts/*"], matches: ["*://chatgpt.com/*"] }],
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
})
