import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      image: true,
      authorFirstName: true,
      authorLastName: true
    }
  })
  return books.map(book => ({
    id: book.id,
    title: book.title,
    imageUrl: book.image,
    authorName: book.authorFirstName + ' ' + book.authorLastName
  }))
})
