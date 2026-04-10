import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400, message: 'Invalid book ID' })

  // DELETE — remove the book (views cascade automatically)
  if (event.method === 'DELETE') {
    await prisma.book.delete({ where: { id } })
    return { ok: true }
  }

  // PATCH — partial update: only fields present in the request body are changed
  if (event.method === 'PATCH') {
    const body = await readBody<Record<string, unknown>>(event)

    const data: Record<string, unknown> = {}

    if ('title' in body)         data.title         = String(body.title ?? '')
    if ('author' in body)        data.author        = body.author ? String(body.author) : null
    if ('callNumber' in body)    data.callNumber    = String(body.callNumber ?? '')
    if ('isbn' in body)          data.isbn          = body.isbn ? String(body.isbn) : null
    if ('lccn' in body)          data.lccn          = body.lccn ? String(body.lccn) : null
    if ('image' in body)         data.image         = body.image ? String(body.image) : null
    if ('genre' in body)         data.genre         = body.genre ? String(body.genre) : null
    if ('description' in body)   data.description   = body.description ? String(body.description) : null
    if ('seriesId' in body)      data.seriesId      = body.seriesId != null ? Number(body.seriesId) : null
    if ('seriesOrder' in body)   data.seriesOrder   = Number(body.seriesOrder) || 0
    if ('popularityScore' in body && typeof body.popularityScore === 'number') {
      data.popularityScore = Math.max(0, body.popularityScore)
    }

    if (Object.keys(data).length === 0) {
      throw createError({ statusCode: 400, message: 'No fields to update' })
    }

    const book = await prisma.book.update({ where: { id }, data })
    return book
  }

  // GET — single book detail for admin edit page
  if (event.method === 'GET') {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        series: { select: { id: true, name: true } },
        _count: { select: { views: true } }
      }
    })
    if (!book) throw createError({ statusCode: 404, message: 'Book not found' })
    return {
      id: book.id,
      title: book.title,
      author: book.author ?? null,
      callNumber: book.callNumber,
      isbn: book.isbn ?? null,
      lccn: book.lccn ?? null,
      imageUrl: book.image ?? null,
      genre: book.genre ?? null,
      description: book.description ?? null,
      popularityScore: Math.round(book.popularityScore * 1000) / 1000,
      seriesId: book.seriesId ?? null,
      seriesOrder: book.seriesOrder,
      seriesName: book.series?.name ?? null,
      viewCount: book._count.views,
      isEnriched: !!(book.description && book.genre)
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
