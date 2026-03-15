import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../app/generated/prisma/client.js'
import data from './seed.json' with { type: 'json' }

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (const book of data) {
    await prisma.book.upsert({
      where: {
        callNumber_title: {
          callNumber: book.callNumber,
          title: book.title
        }
      },
      update: {},
      create: {
        callNumber: book.callNumber,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        lccn: book.lccn,
        image: book.image
      }
    })
  }
  console.log(`Seeded ${data.length} books.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
