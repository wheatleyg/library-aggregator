import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  const [totalBooks, totalViews, unenriched] = await Promise.all([
    prisma.book.count(),
    prisma.bookView.count(),
    prisma.book.count({
      where: { OR: [{ description: null }, { genre: null }] }
    })
  ])
  return { totalBooks, totalViews, unenriched }
})
