export default defineEventHandler(() => {
  return {
    name: 'hi',
    timestamp: Date.now(),
    message: 'pong'
  }
})
