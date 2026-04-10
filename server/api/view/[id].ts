import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid book ID' })
  }

  // Record the view
  await prisma.bookView.create({ data: { bookId: id } })

  // Recalculate time-decayed popularity score.
  // Each view contributes 1 / (age_in_hours + 2), so a view right now
  // contributes 0.5, one from 24 h ago contributes ~0.038, one week ago ~0.006.
  // This means recent activity counts far more than old views.
  const views = await prisma.bookView.findMany({
    where: { bookId: id },
    select: { viewedAt: true }
  })

  const now = Date.now()
  const popularityScore = views.reduce((sum, v) => {
    const ageHours = (now - v.viewedAt.getTime()) / (1000 * 60 * 60)
    return sum + 1 / (ageHours + 2)
  }, 0)

  await prisma.book.update({ where: { id }, data: { popularityScore } })

  return { ok: true }
})
