import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid book ID' })
  }

  await prisma.book.update({
    where: { id },
    data: { description: null, genre: null }
  })

  return { ok: true }
})
