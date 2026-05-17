import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "~/assets/tailwind.css"

function showMountError(error: unknown) {
  if (import.meta.env.DEV) {
    console.error("Token Counter failed to mount:", error)
  }

  if (document.getElementById("token-counter-mount-error")) return

  const fallback = document.createElement("div")
  fallback.id = "token-counter-mount-error"
  fallback.textContent = "Token Counter failed to start"
  fallback.style.cssText =
    "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:999999;background:#121212;color:#fecaca;padding:8px 10px;border-radius:4px;font:12px sans-serif;"
  document.documentElement.appendChild(fallback)
}

export default defineContentScript({
  matches: ["*://chatgpt.com/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    try {
      const ui = await createShadowRootUi(ctx, {
        name: "token-counter-shadow-ui",
        position: "inline",
        anchor: "body",
        onMount: container => {
          const fontUrl = browser.runtime.getURL("/fonts/jbmono.ttf")
          const fontStyle = document.createElement("style")
          fontStyle.id = "token-counter-font"
          fontStyle.textContent = `
            @font-face {
              font-family: 'JB Mono';
              src: url('${fontUrl}') format('truetype');
              font-weight: 400;
              font-style: normal;
            }
        `
          document.getElementById(fontStyle.id)?.remove()
          document.head.appendChild(fontStyle)

          const app = document.createElement("div")
          container.append(app)

          const root = ReactDOM.createRoot(app)
          root.render(<App />)
          return root
        },
        onRemove: root => {
          document.getElementById("token-counter-font")?.remove()
          root?.unmount()
        },
      })
      setTimeout(() => {
        try {
          ui.mount()
        } catch (error) {
          showMountError(error)
        }
      }, 1000)
    } catch (error) {
      showMountError(error)
    }
  },
})
