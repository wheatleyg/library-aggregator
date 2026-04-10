export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  if (!session.data.loggedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return { username: session.data.username }
})
