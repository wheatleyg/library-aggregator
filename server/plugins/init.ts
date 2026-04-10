import { prisma } from '~~/lib/prisma'

export default defineNitroPlugin(async () => {
  // ── Admin user ────────────────────────────────────────────────────────────
  const adminCount = await prisma.adminUser.count()
  if (adminCount === 0) {
    await prisma.adminUser.create({
      data: { username: 'admin', password: 'adminpass12' }
    })
    console.log('[init] Default admin user created (username: admin)')
  }

  // ── Dune trilogy placeholder ───────────────────────────────────────────────
  const duneExists = await prisma.series.findUnique({ where: { name: 'Dune' } })
  if (!duneExists) {
    const duneSeries = await prisma.series.create({
      data: {
        name: 'Dune',
        description: 'Frank Herbert\'s epic science fiction saga set in a distant future.'
      }
    })

    const duneBooks = [
      {
        title: 'Dune',
        author: 'Frank Herbert',
        callNumber: 'SF HER 1',
        isbn: '978-0-441-17271-9',
        seriesOrder: 1,
        description: 'On the desert planet Arrakis, young Paul Atreides navigates treachery, politics, and destiny to become the messiah of the Fremen people.',
        genre: 'Science Fiction'
      },
      {
        title: 'Dune Messiah',
        author: 'Frank Herbert',
        callNumber: 'SF HER 2',
        isbn: '978-0-441-17269-6',
        seriesOrder: 2,
        description: 'Twelve years after his rise to power, Emperor Paul Atreides faces conspiracy and the terrible burden of prescient vision threatening to destroy everything he built.',
        genre: 'Science Fiction'
      },
      {
        title: 'Children of Dune',
        author: 'Frank Herbert',
        callNumber: 'SF HER 3',
        isbn: '978-0-441-10402-4',
        seriesOrder: 3,
        description: 'Paul\'s twin children, Leto and Ghanima, must survive political conspiracies and a failing ecology as they inherit a universe-altering destiny.',
        genre: 'Science Fiction'
      }
    ]

    for (const b of duneBooks) {
      await prisma.book.upsert({
        where: { callNumber_title: { callNumber: b.callNumber, title: b.title } },
        create: { ...b, seriesId: duneSeries.id },
        update: { seriesId: duneSeries.id, seriesOrder: b.seriesOrder }
      })
    }

    console.log('[init] Dune trilogy seeded')
  }
})
