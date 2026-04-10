import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) throw createError({ statusCode: 400 })

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      books: {
        select: {
          id: true,
          title: true,
          author: true,
          image: true,
          genre: true,
          seriesOrder: true
        },
        orderBy: { seriesOrder: 'asc' }
      }
    }
  })

  if (!series) throw createError({ statusCode: 404, message: 'Series not found' })

  return {
    id: series.id,
    name: series.name,
    description: series.description,
    books: series.books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      imageUrl: b.image,
      genre: b.genre,
      order: b.seriesOrder
    }))
  }
})
