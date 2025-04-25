import { defineConfig } from "wxt"
import Tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
  },
  vite: () => ({
    plugins: [Tailwindcss() as any],
  }),
})
