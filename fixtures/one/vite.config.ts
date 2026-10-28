import { one } from "one/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [one({ native: false, router: { root: "src/app" } })]
})
