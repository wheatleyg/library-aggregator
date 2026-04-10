import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') {
    const { name, description } = await readBody<{ name: string; description?: string }>(event)
    if (!name?.trim()) throw createError({ statusCode: 400, message: 'Name is required' })

    const series = await prisma.series.create({
      data: { name: name.trim(), description: description?.trim() || null }
    })
    return series
  }

  // GET — list all series with book count
  const series = await prisma.series.findMany({
    include: {
      _count: { select: { books: true } },
      books: {
        select: { id: true, title: true, author: true, image: true, seriesOrder: true },
        orderBy: { seriesOrder: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  })

  return series.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    bookCount: s._count.books,
    coverUrl: s.books[0]?.image ?? null,
    books: s.books.map(b => ({ id: b.id, title: b.title, author: b.author, imageUrl: b.image, order: b.seriesOrder }))
  }))
})
