import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  const series = await prisma.series.findMany({
    include: {
      _count: { select: { books: true } },
      books: {
        select: { image: true, seriesOrder: true },
        orderBy: { seriesOrder: 'asc' },
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  })

  return series.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    bookCount: s._count.books,
    coverUrl: s.books[0]?.image ?? null
  }))
})
