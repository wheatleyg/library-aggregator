export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',   // refers to your --color-blue-50 → --color-blue-950
      neutral: 'slate'   // you can keep neutral or define your own palette
    },
    defaultMode: 'system' // supports light/dark mode automatically
  }
})
