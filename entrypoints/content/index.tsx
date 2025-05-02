import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "~/assets/tailwind.css"

export default defineContentScript({
  matches: ["*://chatgpt.com/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "token-counter",
      position: "inline",
      anchor: "body",
      onMount: container => {
        const fontUrl = browser.runtime.getURL("/fonts/jbmono.ttf")
        const fontStyle = document.createElement("style")
        fontStyle.textContent = `
            @font-face {
              font-family: 'JB Mono';
              src: url('${fontUrl}') format('truetype');
              font-weight: 400;
              font-style: normal;
            }
        `
        document.head.appendChild(fontStyle)

        const app = document.createElement("div")
        container.append(app)

        const root = ReactDOM.createRoot(app)
        root.render(<App />)
        return root
      },
      onRemove: root => {
        root?.unmount()
      },
    })
    ui.mount()
  },
})
