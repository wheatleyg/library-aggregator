import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid book ID' })
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: { series: { select: { id: true, name: true } } }
  })

  if (!book) {
    throw createError({ statusCode: 404, message: 'Book not found' })
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author ?? null,
    isbn: book.isbn ?? null,
    lccn: book.lccn ?? null,
    callNumber: book.callNumber,
    imageUrl: book.image ?? null,
    description: book.description ?? null,
    genre: book.genre ?? null,
    seriesId: book.seriesId ?? null,
    seriesOrder: book.seriesOrder,
    series: book.series ?? null,
    createdAt: book.createdAt
  }
})
