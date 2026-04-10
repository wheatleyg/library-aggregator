import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  // POST — create a new book
  if (event.method === 'POST') {
    const body = await readBody<{
      title: string
      author?: string
      callNumber?: string
      isbn?: string
      lccn?: string
      image?: string
      genre?: string
      description?: string
      seriesId?: number | null
      seriesOrder?: number
    }>(event)

    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author || null,
        callNumber: body.callNumber || '',
        isbn: body.isbn || null,
        lccn: body.lccn || null,
        image: body.image || null,
        genre: body.genre || null,
        description: body.description || null,
        seriesId: body.seriesId || null,
        seriesOrder: body.seriesOrder ?? 0
      }
    })
    return book
  }

  // GET — list all books for admin
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      callNumber: true,
      isbn: true,
      lccn: true,
      image: true,
      genre: true,
      description: true,
      popularityScore: true,
      seriesId: true,
      seriesOrder: true,
      series: { select: { id: true, name: true } },
      _count: { select: { views: true } }
    },
    orderBy: { popularityScore: 'desc' }
  })

  return books.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author ?? null,
    callNumber: b.callNumber,
    isbn: b.isbn ?? null,
    lccn: b.lccn ?? null,
    imageUrl: b.image ?? null,
    genre: b.genre ?? null,
    description: b.description ?? null,
    seriesId: b.seriesId ?? null,
    seriesOrder: b.seriesOrder,
    seriesName: b.series?.name ?? null,
    isEnriched: !!(b.description && b.genre),
    viewCount: b._count.views,
    popularityScore: Math.round(b.popularityScore * 1000) / 1000
  }))
})
