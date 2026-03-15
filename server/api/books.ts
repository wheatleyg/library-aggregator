import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 12
  const skip = (page - 1) * limit // e.g. page 3 = skip 24

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        author: true
      },
      skip,
      take: limit
    }),
    prisma.book.count() // total number of books in db
  ])

  return {
    books: books.map(book => ({
      id: book.id,
      title: book.title,
      imageUrl: book.image,
      author: book.author
    })),
    total, // e.g. 100
    page, // e.g. 3
    limit // e.g. 12
  }
})
