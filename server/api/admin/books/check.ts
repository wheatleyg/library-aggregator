import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const { title, callNumber, isbn, excludeId } = getQuery(event) as {
    title?: string
    callNumber?: string
    isbn?: string
    excludeId?: string
  }

  const excludeIdNum = excludeId ? Number(excludeId) : undefined
  const conflicts: { field: string; message: string }[] = []

  // Title + callNumber must be unique together (per schema constraint)
  if (title && callNumber) {
    const existing = await prisma.book.findFirst({
      where: {
        title,
        callNumber,
        ...(excludeIdNum ? { NOT: { id: excludeIdNum } } : {})
      }
    })
    if (existing) {
      conflicts.push({
        field: 'title',
        message: `A book with this title and call number already exists (ID: ${existing.id})`
      })
    }
  }

  // ISBN soft check
  if (isbn && isbn.trim()) {
    const existing = await prisma.book.findFirst({
      where: {
        isbn,
        ...(excludeIdNum ? { NOT: { id: excludeIdNum } } : {})
      }
    })
    if (existing) {
      conflicts.push({
        field: 'isbn',
        message: `ISBN already used on "${existing.title}"`
      })
    }
  }

  return { conflicts }
})
