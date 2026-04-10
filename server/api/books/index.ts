import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 12
  const skip = (page - 1) * limit
  const search = (query.search as string)?.trim() || ''
  const genre = (query.genre as string)?.trim() || ''
  const sort = (query.sort as string) || 'popular'

  const orderBy =
    sort === 'popular' ? { popularityScore: 'desc' as const } :
    sort === 'author' ? { author: 'asc' as const } :
    sort === 'recent' ? { createdAt: 'desc' as const } :
    { title: 'asc' as const }

  const where = {
    ...(search ? {
      OR: [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
        { callNumber: { contains: search } }
      ]
    } : {}),
    ...(genre ? { genre } : {})
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        callNumber: true,
        image: true,
        genre: true
      },
      skip,
      take: limit
    }),
    prisma.book.count({ where })
  ])

  return {
    books: books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author ?? null,
      isbn: book.isbn ?? null,
      callNumber: book.callNumber,
      imageUrl: book.image ?? null,
      genre: book.genre ?? null
    })),
    total,
    page,
    limit
  }
})
