export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/admin/')) return

  // These routes are always accessible (auth endpoints)
  const open = ['/api/admin/login', '/api/admin/logout', '/api/admin/me']
  if (open.includes(event.path)) return

  const session = await getAdminSession(event)
  if (!session.data.loggedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
