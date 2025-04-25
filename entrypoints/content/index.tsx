import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "~/assets/tailwind.css"

export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://chatgpt.com/c/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "token-counter",
      position: "inline",
      anchor: "body",
      append: "first",
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
        //container.shadowRoot?.appendChild(fontStyle)

        const wrapper = document.createElement("div")
        container.append(wrapper)

        const root = ReactDOM.createRoot(wrapper)
        root.render(<App />)
        return { root, wrapper }
      },
      onRemove: elements => {
        elements?.root.unmount()
        elements?.wrapper.remove()
      },
    })
    ui.mount()
  },
})
