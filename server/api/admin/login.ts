import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const { username, password } = await readBody<{ username: string; password: string }>(event)

  const user = await prisma.adminUser.findUnique({ where: { username } })

  if (!user || user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const session = await getAdminSession(event)
  await session.update({ loggedIn: true, username: user.username })

  return { ok: true }
})
