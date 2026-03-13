import { PrismaClient } from '../app/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.book.createMany({
    data: [
      {
        title: 'Harry Potter and the Sorcerer’s Stone',
        image: 'https://th.bing.com/th/id/R.a3b0e103299615f4ca27820bff426feb?rik=FzeXKtYnFmAu7g&pid=ImgRaw&r=0',
        authorFirstName: 'J.K.',
        authorLastName: 'Rowling',
        ISBN_13: '978-0-590-35342-7',
        publish_date: new Date('1999-04-01'),
        genre: 'Fantasy'

      },
      {
        title: 'Scythe',
        image: 'https://prodimage.images-bn.com/pimages/9781442472433_p0_v13_s1200x630.jpg',
        authorFirstName: 'Neal',
        authorLastName: 'Shutsterman',
        ISBN_13: '978-1-442-47243-3',
        publish_date: new Date('2016-11-22'),
        genre: 'Horror, Fantasy'
      }
    ],
    skipDuplicates: true
  })
  console.log('seed finished')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
